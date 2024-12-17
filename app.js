const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contact API',
      version: '1.0.0',
      description: 'API pour gérer des contacts',
    },
  },
  apis: ['./app.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connexion à MongoDB
mongoose.connect('mongodb+srv://projetapp:basedonnee@cluster0.lzatl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connexion réussie à MongoDB');
  })
  .catch((error) => {
    console.error('Erreur lors de la connexion à MongoDB :', error);
  });


const todoSchema = new mongoose.Schema({
  prenom: String,
  nom: String,
  email: String,
  telephone: String,
});

const Todo = mongoose.model('Todo', todoSchema);

// Route pour servir le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes de l'API

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: "Récupérer tous les contacts"
 *     responses:
 *       200:
 *         description: "Liste des contacts"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   prenom:
 *                     type: string
 *                   nom:
 *                     type: string
 *                   email:
 *                     type: string
 *                   telephone:
 *                     type: string
 */
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: "Ajouter un nouveau contact"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Contact ajouté avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 prenom:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 email:
 *                   type: string
 *                 telephone:
 *                   type: string
 */
app.post('/todos', async (req, res) => {
  const { prenom, nom, email, telephone } = req.body;
  try {
    const newTodo = new Todo({
      prenom,
      nom,
      email,
      telephone
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).send('Error creating contact');
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: "Modifier un contact"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Contact modifié avec succès"
 *       404:
 *         description: "Contact non trouvé"
 */
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { prenom, nom, email, telephone } = req.body;
  try {
    const contact = await Todo.findByIdAndUpdate(id, { prenom, nom, email, telephone }, { new: true });
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).send('Contact not found');
    }
  } catch (err) {
    res.status(500).send('Error updating contact');
  }
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: "Supprimer un contact"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: "Contact supprimé avec succès"
 */
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send('Error deleting contact');
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API documentation is available at http://localhost:3000/api-docs/`);
});
