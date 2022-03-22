const mongoose = require('mongoose');
const Category = require('../models/category');
const Schema = mongoose.Schema;

exports.createTemplateSchema = (title) => {
  const mySchema = new Schema(
    {
      title: {type: String, required: true, maxlength: 100},
      description: {type: String, required: true},
      category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
      price: {type: Number, required: true},
      number_in_stock: {type: Number, required: true},
      manufacturer: {type: Schema.Types.ObjectId, ref: 'Manufacturer', required: true},
      image: {
        data: {type: Buffer}, 
        contentType: {type: String}
      }
    },
    {collection: title}
  )

  mySchema
  .virtual('url')
  .get(async function () {
    const getCategoryName = await Category.findById(this.category);
    return `/home/categories/${getCategoryName.title}/${this.title}`
  })

  return mySchema;
}