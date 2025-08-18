// controllers/messageTemplate.controller.js
import { MessageTemplate } from "./messageTemplate.model.js";
import { errorHandler } from "../../utils/error.js";

// Create a new template
export const createTemplate = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user.id;

    if (!title || !content) {
      return next(errorHandler(400, "Title and content are required"));
    }

    const template = new MessageTemplate({
      title,
      content,
      createdBy,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Get all templates for a user
export const getTemplates = async (req, res, next) => {
  try {
    const templates = await MessageTemplate.find({
      createdBy: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

// Update a template
export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return next(errorHandler(400, "Title and content are required"));
    }

    const template = await MessageTemplate.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { title, content },
      { new: true }
    );

    if (!template) {
      return next(errorHandler(404, "Template not found"));
    }

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a template
export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await MessageTemplate.findOneAndDelete({
      _id: id,
      createdBy: req.user.id,
    });

    if (!template) {
      return next(errorHandler(404, "Template not found"));
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Search templates
export const searchTemplates = async (req, res, next) => {
  try {
    const { query } = req.query;
    const createdBy = req.user.id;

    if (!query) {
      return next(errorHandler(400, "Search query is required"));
    }

    const templates = await MessageTemplate.find({
      createdBy,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    next(error);
  }
};
