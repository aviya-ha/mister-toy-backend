import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import {utilService} from '../../services/util.service.js'
import mongodb from 'mongodb'
const {ObjectId} = mongodb

const PAGE_SIZE = 3


async function query(filterBy, sortBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')
        const toys = await collection.find(criteria).sort(sortBy).toArray()
        // var toyCursor = await collection.find(criteria)

        // if (filterBy.pageIdx !== undefined) {
        //     toyCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)     
        // }

        // const toys = toyCursor.toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy =  await collection.findOne({ _id: ObjectId(toyId) })
        toy.createdAt = ObjectId(toy._id).getTimestamp()

        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
        return toyId
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            inStock: toy.inStock,
            img: toy.img,
          }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const { labels, txt, status } = filterBy

    const criteria = {}

    if (txt) {
        criteria.name = { $regex: txt, $options: 'i' }
    }

    if (labels && labels.length) {
        criteria.labels = { $in: labels }
    }

    if (status) {
        criteria.inStock = status === 'true' ? true : false
    }

    return criteria
}

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
