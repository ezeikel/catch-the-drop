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
  }
};

module.exports = Mutations;
