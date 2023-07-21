function createCategories(categories, parentId = null) {
  const categoryList = []
  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined)
  } else {
    category = categories.filter((cat) => cat.parentId == parentId)
  }
  for (const cate of category) {
    if (cate.parentId == parentId) {
      const category = {
        id: cate.id,
        name: cate.name,
        children: createCategories(categories, cate.id)
      }
      categoryList.push(category)
    }
  }
  return categoryList
}

module.exports = {
  createCategories
}
