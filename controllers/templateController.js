const mongoose = require('mongoose');
const Category = require('../models/category');
const Manufacturer = require('../models/manufacturer');
const TemplateSchema = require('../templateSchemas/createTemplateSchema');

const fs = require('fs');
const path = require('path');

const async = require('async');
const { body, validationResult } = require('express-validator');


exports.inventory_create_get = (req, res) => {
  async.parallel({
    categories: (callback) => Category.findOne({'title': req.params.title}).exec(callback),
    manufacturers: (callback) => Manufacturer.find({}).exec(callback),
  }, (err, results) => {
    if (err) return next(err)
    res.render('template_form', {
      title: 'Create Element of the Category', 
      category: results.categories, 
      manufacturers: results.manufacturers
    })
  })
}

exports.inventory_create_post = [
  body('title', 'title required').trim().isLength({min: 1}).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));

    console.log(req.file)

    const inventory = new requiredModel({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      manufacturer: req.body.manufacturer,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
    })

    if (!errors.isEmpty()) {
      res.render('template_form', {
        title: 'Create Element of the Category', 
        category: req.params.title, 
        manufacturers: results.manufacturers
      })
    } else {
      requiredModel.findOne({'title': inventory.title})
        .exec((err, found_inventory) => {
          if (err) {
            return next(err);
          } else if (found_inventory) {
            res.redirect(found_inventory.url)
          } else {
            inventory.save((err) => {
              if(err) {
                console.log('hello!');
                console.log(err)
                return next();
              }
                Promise.resolve(inventory.url)
                  .then(response => {
                    res.redirect(response);
                  })
            })
          }
        })
    }
  }
]

exports.inventory_detail = async (req, res, next) => {
  try {
    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
    const document = await requiredModel.findOne({'title': req.params.model_name}, '-_id -__v').populate('manufacturer').populate('category');  

    let urlObject = {
      category: document.category.url,
      manufacturer: document.manufacturer.url,
    }

    res.render('template_detail', {
      title: document.get('title'), 
      document: document.toObject(),
      urlObject: urlObject,
    });
  } catch (error) {
    next(error)
  }
}

exports.inventory_delete_get = async (req, res, next) => {
  try {
    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
    const document = await requiredModel.findOne({'title': req.params.model_name});
    res.render('inventory_delete', {
      title: `Delete ${req.params.model_name}`,
      document: document
    })
  } catch (error) {
    next(error)
  }
}

exports.inventory_delete_post = async (req, res, next) => {
  try {
    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
    requiredModel.findByIdAndRemove(req.body.inventoryId, function deleteInventory(err) {
      return err ? next(err) : res.redirect(`/home/categories/phone`)
    })
  } catch (error) {
    next(error);
  }
}

exports.inventory_update_get = async (req, res, next) => {
  try {
    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
    const document = await requiredModel.findOne({title: req.params.model_name})
      .populate('category');
    const category = await Category.findById(document.category._id);
    const manufacturers = await Manufacturer.find({});
    res.render('template_form', {
      title: `Update ${document.title}`,
      inventory: document,
      manufacturers: manufacturers,
      category: category,
    })
  } catch (error) {
    next(error)
  }
}

exports.inventory_update_post = [
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('number_in_stock', 'Number in stock must not be empty.').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const requiredModel = mongoose.models[req.params.title] || mongoose.model(req.params.title, TemplateSchema.createTemplateSchema(req.params.title));
    const inventory = new requiredModel({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      manufacturer: req.body.manufacturer,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      _id: req.body.id,
    })

    if (!errors.isEmpty()) {
      res.render('template_form', {
        title: `Update ${inventory.title}`,
        category: inventory,
        errors: errors.array()
      })
    } else {
      requiredModel.findByIdAndUpdate(inventory._id, inventory, {}, async (err) => {
        if (err) {
          next(err);
        } else {
          const url = await inventory.url;
          res.redirect(url);
        }
      })
    }
  }
]