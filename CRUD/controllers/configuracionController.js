const Configuracion = require('../models/Configuracion');

const configuracionController = {
    guardarConfiguracion: async (req, res) => {
        const config = req.body;
        try {
            const nuevaConfiguracion = await Configuracion.create({
                jsonConfig: JSON.stringify(config),
                fechaHora: new Date() // Asegúrate de que este campo se maneje correctamente si no es automático
            });
            const configId = nuevaConfiguracion.id;
            const configUrl = `https://cotizador.cloud/builds/${configId}`;
            res.status(200).json({ message: 'Configuración guardada con éxito', url: configUrl });
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
            res.status(500).json({ message: 'Error interno del servidor al guardar la configuración.' });
        }
    },

    recuperarConfiguracion: async (req, res) => {
        const configId = req.params.id;
        try {
            const configuracion = await Configuracion.findByPk(configId);
            if (!configuracion) {
                return res.status(404).json({ message: 'Configuración no encontrada.' });
            }
            const configData = JSON.parse(configuracion.jsonConfig);
            const fechaHora = configuracion.fechaHora;
            res.status(200).json({ configData, fechaHora });
        } catch (error) {
            console.error('Error al recuperar la configuración:', error);
            res.status(500).json({ message: 'Error interno del servidor al recuperar la configuración.' });
        }
    },

    updateConfiguracion: async (req, res) => {
        const configId = req.params.id;
        const updatedConfig = req.body;
        try {
            const [numRowsUpdated, updatedRows] = await Configuracion.update(
                { jsonConfig: JSON.stringify(updatedConfig) },
                { where: { id: configId }, returning: true }
            );

            if (numRowsUpdated === 0) {
                return res.status(404).json({ message: 'Configuración no encontrada para actualizar.' });
            }
            res.status(200).json({ message: 'Configuración actualizada con éxito.', updatedConfig: updatedRows[0] });
        } catch (error) {
            console.error('Error al actualizar la configuración:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar la configuración.' });
        }
    }
};

module.exports = configuracionController;