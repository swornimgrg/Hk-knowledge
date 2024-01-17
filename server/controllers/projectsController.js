const Project = require('../models/Project')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all projects 
// @route GET /projects
// @access Private
const getAllProjects = asyncHandler(async (req, res) => {
    // Get all projects from MongoDB
    const projects = await Project.find().lean()

    // If no projects 
    if (!projects?.length) {
        return res.status(400).json({ message: 'No projects found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const projectWithUser = await Promise.all(projects.map(async (project) => {
        const user = await User.findById(project.user).lean().exec()
        console.log(project)
        return { ...project, username: user.username }
    }))

    res.json(projectWithUser)
})

// @desc Create new project
// @route POST /projects
// @access Private
const createNewProject = asyncHandler(async (req, res) => {
    const { user, title, text, members } = req.body

    // Confirm data
    if (!user || !title || !text || !members) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Project.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate project title' })
    }

    // Create and store the new user 
    const project = await Project.create({ user, title, text, members })

    if (project) { // Created 
        return res.status(201).json({ message: 'New project created' })
    } else {
        return res.status(400).json({ message: 'Invalid project data received' })
    }

})

// @desc Update a project
// @route PATCH /projects
// @access Private
const updateProject = asyncHandler(async (req, res) => {
    const { id, user, title, text, members,completed } = req.body
    console.log(req.body)

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm project exists to update
    const project = await Project.findById(id).exec()

    if (!project) {
        return res.status(400).json({ message: 'Project not found' })
    }

    // Check for duplicate title
    const duplicate = await Project.findOne({ title }).lean().exec()

    // Allow renaming of the original project 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate project title' })
    }

    project.user = user
    project.title = title
    project.text = text
    project.completed = completed
    project.members = members
    const updatedProject = await project.save()

    res.json(`'${updatedProject.title}' updated`)
})

// @desc Delete a project
// @route DELETE /projects
// @access Private
const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Project ID required' })
    }

    // Confirm note exists to delete 
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Project not found' })
    }

    const result = await project.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllProjects,
    createNewProject,
    updateProject,
    deleteProject
}

