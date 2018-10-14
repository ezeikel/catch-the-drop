const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Mutations = {
  async createItem(_, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)

    return item;
  },
  updateItem(_, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID form the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info);
  },
  async deleteItem(_, args, ctx, info) {
    const where =  { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // 2. check if they own that item, or have the permissions
    // TODO
    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(_, args, ctx, info) {
    // lowercase email
    args.email = args.email.toLowerCase();
    // hash password
    const password = await bcrypt.hash(args.password, 10);
    // create user in the db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info);
    // create JWT token for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // we set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // finally return user the the browser
    return user;
  }
};

module.exports = Mutations;
