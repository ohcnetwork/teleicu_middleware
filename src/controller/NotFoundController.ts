export const notFoundController = (req, res, next) => {
  res.status(404).render("pages/notFound");
};
