const Component = require('../models/Component');

// Obtener todos los componentes
exports.getAllComponents = async (req, res) => {
  try {
    const components = await Component.findAll();
    res.json(components);
  } catch (error) {
    console.error('Error al obtener componentes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un componente por ID
exports.getComponentById = async (req, res) => {
  try {
    const { id } = req.params;
    const component = await Component.findByPk(id);
    if (component) {
      res.json(component);
    } else {
      res.status(404).json({ message: 'Componente no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener componente por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener componentes por modelo (búsqueda parcial)
exports.getComponentsByModel = async (req, res) => {
  try {
    const { modelo } = req.params;
    const components = await Component.findAll({
      where: {
        modelo: { [require('sequelize').Op.like]: `%${modelo}%` }
      }
    });
    if (components.length > 0) {
      res.json(components);
    } else {
      res.status(404).json({ message: 'No se encontraron componentes con ese modelo' });
    }
  } catch (error) {
    console.error('Error al obtener componentes por modelo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener componentes por tipo (procesadores, motherboards, etc.)
exports.getComponentsByType = async (req, res) => {
  try {
    const { tipo } = req.params;
    const components = await Component.findAll({
      where: {
        tipo: tipo
      }
    });
    if (components.length > 0) {
      res.json(components);
    } else {
      res.status(404).json({ message: `No se encontraron componentes del tipo ${tipo}` });
    }
  } catch (error) {
    console.error(`Error al obtener componentes del tipo ${tipo}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo componente
exports.createComponent = async (req, res) => {
  try {
    const newComponent = await Component.create(req.body);
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error al crear componente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar un componente existente
exports.updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Component.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedComponent = await Component.findByPk(id);
      res.json(updatedComponent);
    } else {
      res.status(404).json({ message: 'Componente no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar componente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un componente
exports.deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Component.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).json({ message: 'Componente eliminado' });
    } else {
      res.status(404).json({ message: 'Componente no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar componente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};