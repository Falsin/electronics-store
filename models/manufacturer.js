const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema(
  {
    brand_name: {type: String, required: true, maxlength: 100},
    description: {type: String, required: true},
  }
)

ManufacturerSchema
  .virtual('url')
  .get(function () {
    return '/home/manufacturers/' + this.brand_name
  })

module.exports = mongoose.model('Manufacturer', ManufacturerSchema)