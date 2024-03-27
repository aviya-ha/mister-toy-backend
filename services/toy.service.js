
import fs from 'fs'
import { utilService } from './util.service.js'
const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    getById,
    save,
    remove
}

function query(filterBy, sortBy) {

    let filteredToys = toys
    if (!filterBy.name) filterBy.name = ''
    if (!filterBy.maxPrice) filterBy.maxPrice = 9999999999
    if (!filterBy.inStock) filterBy.inStock = 'all'
    if (filterBy.inStock === 'inStock') filterBy.inStock = false
    if (filterBy.inStock === 'outStock') filterBy.inStock = true
    if (filterBy.inStock === 'all') filterBy.inStock = null
    if (sortBy.type === 'createAt') {
        if (sortBy.desc) sortBy.desc = 1
        if (!sortBy.desc) sortBy.desc = -1
        filteredToys.sort((t1, t2) => (sortBy.desc) * (t2.createAt - t1.createAt))
    }
    if (sortBy.type === 'price') {
        if (sortBy.desc) sortBy.desc = 1
        if (!sortBy.desc) sortBy.desc = -1
        filteredToys.sort((t1, t2) => (sortBy.desc) * (t2.price - t1.price))
    }
    if (sortBy.type === 'name') {
        var num
        if (sortBy.desc) num = 1
        if (!sortBy.desc) num = -1
        filteredToys.sort((t1, t2) => (num) * (t2.name.localeCompare(t1.name)))
    }

    const regExp = new RegExp(filterBy.name, 'i')
    filteredToys.filter(toy =>
        regExp.test(toy.name) &&
        toy.price <= filterBy.maxPrice &&
        toy.inStock !== filterBy.inStock
    )


    return Promise.resolve(filteredToys);
}

function getById(_id) {
    const toy = toys.find(toy => toy._id === _id)
    //
    return Promise.resolve(toy);
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    toys.splice(idx, 1);
    _saveToysToFile()
    return Promise.resolve();
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = new Date(Date.now());
        toy._id = _makeId();
        toys.unshift(toy);
    }
    _saveToysToFile();
    return Promise.resolve(toy);
}



function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

function _saveToysToFile() {
    fs.writeFileSync('data/toy.json', JSON.stringify(toys, null, 2));
}
