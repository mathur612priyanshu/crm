const fs = require('fs');
const path = require('path');
const Template = require('../models/template_model');

const getLocalFileUrl = (file) => {
  return `/uploads/templates/${file.filename}`;
};

const getPublicFileUrl = (req, fileUrl) => {
  if (!fileUrl) return fileUrl;

  try {
    const pathname = fileUrl.startsWith('http')
      ? new URL(fileUrl).pathname
      : fileUrl;

    if (!pathname.startsWith('/uploads/templates/')) return fileUrl;
    return `${req.protocol}://${req.get('host')}${pathname}`;
  } catch (err) {
    return fileUrl;
  }
};

const deleteLocalUploadedFile = (fileUrl) => {
  if (!fileUrl) return;

  try {
    const pathname = fileUrl.startsWith('http')
      ? new URL(fileUrl).pathname
      : fileUrl;

    if (!pathname.startsWith('/uploads/templates/')) return;

    const filename = path.basename(pathname);
    const filePath = path.join(__dirname, '..', 'uploads', 'templates', filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting local uploaded file:', err.message);
      }
    });
  } catch (err) {
    console.error('Invalid local file URL:', fileUrl);
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, description, fileType } = req.body;
    let fileUrl = null;

    if (fileType !== "none") {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      fileUrl = getLocalFileUrl(req.file);
    } else if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    const newTemplate = await Template.create({
      name,
      description,
      fileType,
      fileUrl,
    });

    return res.status(200).json({
      success: true,
      message: 'Template created successfully',
      data: newTemplate,
    });
  } catch (err) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: templates, count: totalCount } = await Template.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const data = templates.map((template) => {
      const json = template.toJSON();
      return {
        ...json,
        fileUrl: getPublicFileUrl(req, json.fileUrl),
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await Template.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    deleteLocalUploadedFile(template.fileUrl);
    await template.destroy();

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
