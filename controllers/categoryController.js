const Category = require('../models/Category');

exports.getCategoriesPage = async (req, res) => {
  try {
    res.render('categories');
  } catch (error) {
    console.error('Error rendering categories page:', error);
    res.status(500).send('Error loading categories page');
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.getById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCategory = await Category.create(categoryName.trim(), description || '');
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.update(id, categoryName.trim(), description || '');
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Category.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const usage = await Category.getUsageCount(id);
    if (usage > 0) {
      return res.status(409).json({
        message: `Cannot delete category: it is used by ${usage} item(s). Remove or reassign those items first.`,
        inUse: true,
        usageCount: usage
      });
    }

    await Category.delete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};
