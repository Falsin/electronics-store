const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    title: {type: String, required: true, maxlength: 100},
    description: {type: String, required: true},
  }
)

CategorySchema
  .virtual('url')
  .get(function () {
    return '/home/categories/' + this.title;
  })

module.exports = mongoose.model('Category', CategorySchema)