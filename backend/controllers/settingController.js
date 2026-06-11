const Setting = require('../models/settingsModel');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const settingsObj = {};
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        settingsObj[setting.key] = setting.value;
      }
    });
    res.status(200).json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body; // Expects an object of key-value pairs
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      const existingSetting = await Setting.findOne({ where: { key } });
      if (existingSetting) {
        await existingSetting.update({ value: stringValue });
      } else {
        await Setting.create({ key, value: stringValue });
      }
    }
    res.status(200).json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
