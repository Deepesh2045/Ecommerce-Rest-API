import express from "express";
import {
  isBuyer,
  isSeller,
  isUser,
} from "../middleware/authentication.middleware.js";
import { addProductValidationSchema } from "./product.validation.js";
import Product from "./product.model.js";
import mongoose from "mongoose";
import { checkMongoIdValidityFromParams } from "../middleware/mongoId.validity.middleware.js";
import { paginationValidationSchema } from "../utils/pagination.validation.js";

const router = express.Router();

// add product system user role => seller
router.post(
  "/product/add",
  isSeller,
  async (req, res, next) => {
    // extract new product from req.body
    const newProduct = req.body;
    // validate new product
    try {
      const validatedData = await addProductValidationSchema.validate(
        newProduct
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract new product from req.body
    const newProduct = req.body;
    // add sellerId
    newProduct.sellerId = req.loggedInUserId;

    // create Product
    await Product.create(newProduct);
    // send response
    return res.status(200).send({ message: "Product is added successfully." });
  }
);
// get product details
router.get(
  "/product/details/:id",
  isUser,
  checkMongoIdValidityFromParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;
    // find product
    const product = await Product.findOne({ _id: productId });
    // if not find product throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }
    // send product as response
    return res
      .status(200)
      .send({ message: "Success", productDetails: product });
  }
);

// delete product
router.delete(
  "/product/delete/:id",
  isSeller,
  checkMongoIdValidityFromParams,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;
    // find product
    const product = await Product.findById(productId);
    // if not product throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist." });
    }
    console.log(product);
    console.log(req.loggedInUserId);
    // check for owner of product
    // loggedInUserId must be same with product's sellerId
    const isOwnerOfProduct = product.sellerId.equals(req.loggedInUserId);
    // if not owner of product throw error
    if (!isOwnerOfProduct) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }
    // delete product
    await Product.deleteOne({ _id: productId });
    return res
      .status(200)
      .send({ message: "Product is deleted successfully..." });
  }
);

// edit product
router.put(
  "/product/edit/:id",
  isSeller,
  checkMongoIdValidityFromParams,
  async (req, res, next) => {
    // extract new product from req.body
    const newProduct = req.body;
    // validate new product
    try {
      const validatedData = await addProductValidationSchema.validate(
        newProduct
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;
    // find product
    const product = await Product.findById(productId);
    // if not find product throw error
    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }
    // check for ownership of product
    const isOwnerOfProduct = product.sellerId.equals(req.loggedInUserId);
    // if not ownership of product throw error
    if (!isOwnerOfProduct) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }
    // extract new value from req.body
    const newValues = req.body;
    // edit product
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          ...newValues,
        },
      }
    );
    // send response
    return res
      .status(200)
      .send({ message: "Product is updated successfully." });
  }
);

// get product list by buyer
router.post(
  "/product/list/buyer",
  isBuyer,
  async (req, res, next) => {
    // extract pagination data from req.body
    const paginationData = req.body;
    // validation pagination data
    try {
      const validatedData = await paginationValidationSchema.validate(
        paginationData
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract pagination data from req.body
    // const {page,limit}= req.body
    const paginationData = req.body;
    // calculate skip
    const skip = (paginationData.page - 1) * paginationData.limit;
    // run query
    const productList = await Product.aggregate([
      { $match: {} },
      { $skip: skip },
      { $limit: paginationData.limit },

      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          description: 1,
          image: 1,
        },
      },
    ]);
    return res
      .status(200)
      .send({ message: "Success", productList: productList });
  }
);

// get product list by seller
router.post(
  "/product/list/seller",
  isSeller,
  async (req, res, next) => {
    // extract pagination data from req.body
    const paginationData = req.body;
    // validation pagination data
    try {
      const validatedData = await paginationValidationSchema.validate(
        paginationData
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract pagination data from req.body
    const paginationData = req.body;
    // calculate skip
    const skip = (paginationData.page - 1) * paginationData.limit;
    // run query
    const productList = await Product.aggregate([
      { $match: { sellerId: req.loggedInUserId } },
      {
        $skip: skip,
      },
      {
        $limit: paginationData.limit,
      },
      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          description: 1,
          image: 1,
        },
      },
    ]);
    return res
      .status(200)
      .send({ message: "Success", productList: productList });
  }
);
export default router;
