const mongoose = require('mongoose');
const Category = require('../models/category');
const TemplateSchema = require('../templateSchemas/createTemplateSchema');
const Manufacturer = require('../models/manufacturer');

var async = require('async');
const { body, validationResult } = require("express-validator");
const { response } = require('express');

async function returnData(title) {
  const requiredModel = mongoose.models[title] || mongoose.model(title, TemplateSchema.createTemplateSchema(title));
  const documentCollection = await requiredModel.find({})/* .populate('manufacturer') *//* .populate('category'); */

  const asyncArray = documentCollection.map(async (elem) => {
    const url = await elem.url;
    let object = elem.toObject();
    object.url = url;
    return object;
  })
  
  return Promise.all(asyncArray)
}

exports.index = async (req, res, next) => {
  try {
    res.render('home_page')
  } catch (error) {
    next(error);
  }
}

exports.category_list = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.render('category_list', {categories: categories})
  } catch (error) {
    next(error)
  }
}

exports.category_detail = (req, res, next) => {
  async.parallel({
    category: (callback) => Category.findOne({'title': req.params.title}).exec(callback),
    collection: (callback) => {
      returnData(req.params.title).then(result => callback(null, result))
    }
  }, (err, results) => {
    if (err) return next(err);
    res.render('category_detail', {
      title: `${results.category.title}`, 
      category: results.category,
      collection: results.collection,
    })
  })

}

exports.category_create_get = (req, res) => {
  res.render('category_form', {title: 'Create Category'})
}

exports.category_create_post = [
  body('title', 'Category name required').trim().isLength({min: 1}).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category(
      {
        title: req.body.title,
        description: req.body.description
      }
    )

    if (!errors.isEmpty()) {
      res.render('category_form', {title: 'Create Category', category: category, errors: errors.array()})
    } else {
      Category.findOne({'title': req.body.title})
        .exec(async (err, found_category) => {
          if (err) {
            return next(err)
          } else if (found_category) {
            res.redirect(found_category.url)
          } else {
            const storeData = new Category({
              title: req.body.title,
              description: req.body.description,
            })

            await storeData.save();
            mongoose.model(req.body.title, TemplateSchema.createTemplateSchema(req.body.title));
            
            res.redirect(storeData.url)
          }
      })
    }
  }
]

exports.category_delete_get = async (req, res, next) => {
  try {
    const document = await Category.findOne({'title': req.params.title});
    return res.render('category_delete', {
      title: `Delete ${document.title}`,
      document: document,
    })
  } catch (error) {
    next(error);
  }
}

exports.category_delete_post = async (req, res, next) => {
  Category.deleteOne({title: req.params.title}, err => {
    if (err) return next(err);
  })

  const model = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
  await model.collection.drop();
  delete mongoose.models[req.params.title];
  res.redirect('/home/categories/')
}

exports.category_update_get = async (req, res, next) => {
  try {
    const document = await Category.findOne({title: req.params.title});
    res.render('category_form', {
      title: `Update ${document.title}`,
      category: document
    })
  } catch (error) {
    next(error);
  }
}

exports.category_update_post = [
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    let category = new Category({
      title: req.body.title,
      description: req.body.description,
      _id: req.body.categoryId
    })

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: `Update ${category.title}`,
        category: category,
        errors: errors.array()
      })
    } else {
      const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
      const documents = await requiredModel.find({});
      
      await requiredModel.collection.drop();
      delete mongoose.models[req.params.title];

      const createNewModel = mongoose.models[category.title] || mongoose.model(category.title, TemplateSchema.createTemplateSchema(category.title));
      await createNewModel.insertMany(documents);

      Category.findByIdAndUpdate(category._id, category, {}, (err, oldDocument) => {
        return err ? next(err) : res.redirect(category.url);
      })
    }
  }
]