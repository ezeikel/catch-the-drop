const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(_, args, ctx, info) {
    // check if there is current userId
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info);
  },
  async users(_, args, ctx, info) {
    // 1. check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    // 2. check if the user has the permissions to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPATE']);

    // 3. if they do, query all the users
    return ctx.db.query.users({}, info);
  },
  async order(_, args, ctx, info) {
    // 1. make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('You are not logged in!');
    }
    // 2. query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);
    // 3. check if they have the permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.includes('ADMIN');
    if(!ownsOrder || !hasPermission) {
      throw new Error('You cant see this bud!');
    }
    // 4. return the order
    return order;
  },
  async orders(_, args, ctx, info) {
    const { userId } = ctx.request;

    if(!userId) {
      throw new Error('You must be signed in!');
    }

    return ctx.db.query.orders({
      where: {
        user: { id: userId }
      }
    }, info);
  }
};

module.exports = Query;
