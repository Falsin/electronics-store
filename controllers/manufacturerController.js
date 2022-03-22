var async = require('async');
const { body, validationResult, Result } = require("express-validator");
const mongoose = require('mongoose');
const TemplateSchema = require('../templateSchemas/createTemplateSchema');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category')

exports.manufacturer_list = async (req, res, next) => {
  try {
    const manufacturers = await Manufacturer.find({});
    res.render('manufacturer_list', {
      manufacturers: manufacturers
    })
  } catch (error) {
    next(error)
  }
}

exports.manufacturer_get = (req, res) => {
  res.render('manufacturer_form', {title: 'Create Manufacturer'});
}

exports.manufacturer_post = [
  body('brand_name', 'Brand name required').trim().isLength({min: 1}).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const manufacturer = new Manufacturer({
      brand_name: req.body.brand_name,
      founded: req.body.founded,
      description: req.body.description,
    })

    if (!errors.isEmpty()) {
      res.render('manufacturer_form', {
        title: 'Create Manufacturer', 
        manufacturer: manufacturer, 
        errors: errors.array()
      })
    } else {
      Manufacturer.findOne({'brand_name': manufacturer.brand_name})
        .exec((err, found_manufacturer) => {
          if (err) {
            return next(err)
          } else if (found_manufacturer) {
            res.redirect(found_manufacturer.url)
          } else {
            manufacturer.save((err) => {
              if(err) return next(err);
              res.redirect(manufacturer.url);
            });
          }
        })
    }
  }
]

exports.manufacturer_detail = async (req, res, next) => {
  try {
    const manufacturer = await Manufacturer.findOne({'brand_name': req.params.title});
    const documentCollection = await getDocumentCollection(manufacturer);
    res.render('manufacturer_detail', {
      manufacturer: manufacturer, 
      documentCollection: documentCollection
    });
  } catch (error) {
    next(error)
  }
}

exports.manufacturer_detele_get = async (req, res, next) => {
  try {
    const manufacturer = await Manufacturer.findOne({'brand_name': req.params.title});
    const documentCollection = await getDocumentCollection(manufacturer);

    res.render('manufacturer_delete', {
      title: 'Delete manufacturer',
      documentCollection: documentCollection,
      manufacturer: manufacturer,
    })

  } catch (error) {
    next(error);
  }
}

exports.manufacturer_detele_post = async (req, res, next) => {
  try {
    Manufacturer.findByIdAndRemove(req.body.manufacturerId, (err) => {
      return (err) ? next(err) : res.redirect('/home/manufacturers')
    })

  } catch (error) {
    next(error)
  }
}

exports.manufacturer_update_get = async (req, res, next) => {
  try {
    const document = await Manufacturer.findOne({title: req.params.title});
    res.render('manufacturer_form', {
      title: `Update ${document.brand_name}`,
      manufacturer: document,
    })
  } catch (error) {
    next(error) 
  }
}

exports.manufacturer_update_post = [
  body('brand_name', 'Brand name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const manufacturer = new Manufacturer({
      brand_name: req.body.brand_name,
      description: req.body.description,
      _id: req.body.id
    })

    if (!errors.isEmpty()) {
      res.render('manufacturer_form', {
        title: `Update ${manufacturer.brand_name}`,
        manufacturer: manufacturer,
        errors: errors.array(),
      })
    } else {
      Manufacturer.findByIdAndUpdate(manufacturer._id, manufacturer, {}, (err) => {
        return err ? next(err) : res.redirect(manufacturer.url)
      })
    }
  }
]

async function getDocumentCollection(document) {
  const getCollectionNames = (await Category.find({}, 'title -_id'))
    .map(elem=> elem.toObject().title);
  
  let documentCollection = [];

  for (const elem of getCollectionNames) {
    const requiredCollection = mongoose.models[elem] || mongoose.model(elem, mongoose.Schema(TemplateSchema.createTemplateSchema(elem), {collection: elem}));
    let documents = await requiredCollection.find({manufacturer: `${document._id}`}, '-__v')
      .populate('category').populate('manufacturer');

      documents = documents.map(async (elem) => {
        const url = await elem.url;
        let createObj = elem.toObject();
        createObj.url = url;
        return Object.defineProperty(createObj, '_id', {
          value: createObj._id,
          enumerable: false,
        })
      });

      const promiseCollection = await Promise.all(documents)
      documentCollection.push(...promiseCollection)
  }
  return documentCollection;
}