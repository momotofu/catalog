import * as ko from 'knockout'
import keyhandlerBindingFactory from '../utils/js/utils'

const ENTER_KEY = 13
const ESCAPE_KEY = 27

// a custom binding to handle the enter key
ko.bindingHandlers.enterKey = keyhandlerBindingFactory(ENTER_KEY)

// another custom binding, this time to handle the escape key
ko.bindingHandlers.escapeKey = keyhandlerBindingFactory(ESCAPE_KEY)


// Category model
class Category {
  constructor(data, isPlaceholder) {
    // keep track of whether or not Category is a dummy,
    // and need's to be updated from the server
    this.isPlaceholder = isPlaceholder

    if (!isPlaceholder) {
      // map data keys and values to Category
      for (let prop in data) {
        if (data.hasOwnProperty(prop))  {
          eval(`this.${prop} = data.${prop}`)
        }
      }

    } else {
      // give object filler attribute values to satisify the DOM
      this.id = Math.random().toString(36).substring(7)
      this.name = data.name
      this.depth = -1
      this.type = -1
      this.parentId = -1
    }

  }
}

// TODO: seperate concerns by using KO components

// ViewModel
const CategoryList = function(categories, delegate) {
  this.delegate = delegate

  // state
  this.isEditing = ko.observable(false)
  this.canAdd = ko.observable(false)
  this.activeCategoryId = ko.observable(-1)
  this.isActiveClass = function(id) {
    return this.activeCategoryId() == id ? 'active' : ''
  }.bind(this)
  this.editedCategories = []


  // getters
  this.getCategory = function(id) {
    return this.categories().filter((category) => {
      return category.id === id
    })[0]
  }


  // setters
  this.setIsEditing = function() {
    this.isEditing(!this.isEditing())

    if (this.isEditing() && this.canAdd()) {
      this.setCanAdd()
    }

  }.bind(this)

  this.setCanAdd = function() {
    this.canAdd(!this.canAdd())

    if (this.isEditing() && this.canAdd) {
      this.setIsEditing()
    }

  }.bind(this)

  this.setActiveCategoryId = function(id) {
    this.activeCategoryId(id)
    this.delegate.setActiveCategory(this.getCategory(id))
  }.bind(this)


  // map array of passed in categories to an observableArray of category objects
  if (categories.length > 0) { // protect against null list
    this.categories = ko.observableArray(categories.map((category) => {
      return new Category(category)
    }))

    this.setActiveCategoryId(this.categories()[0].id)
  } else {
    this.categories = ko.observableArray([])
  }


  // methods
  this.categoryEdited = function(context, event) {
    // update DOM
    if (event.target.value.length > 0 && event.target.placeholder != event.target.value) {
      context.name = event.target.value

      // add category object to editedCategories list
      this.editedCategories.push(context)
    }

  }.bind(this)

  this.onEditButtonClick = function() {
    this.setIsEditing()

    if (!this.isEditing()) {
      // update server
      $.post({
        url : '/categories/update',
        data : {
          categories : JSON.stringify(this.editedCategories)
        },
        success: successHandler.bind(this),
        dataType: 'json'
      })

      function successHandler(data) {
        // success message
        console.log('Successfuly updated categories on the server.')

        // reset editedCategories
        this.editedCategories = []
      }
    }

    this.setFirstCategoryBorderRadius()

  }.bind(this)

  this.onAddButtonClick = function() {
    this.setCanAdd()

    const el = document.getElementById('canAddInput')

    if (this.canAdd()) {
      el.focus()
    } else {
      el.value = ""
    }

    this.setFirstCategoryBorderRadius()

  }.bind(this)

  this.setFirstCategoryBorderRadius = function() {
    console.log('called')
    // change first list item border-radius
    const firstCategory = document.getElementById('category-list').children[1]

    if (firstCategory) {
      if (!this.canAdd()) {
        firstCategory.style.borderTopRightRadius = '3px'
        firstCategory.style.borderTopLeftRadius = '3px'
      } else {
        firstCategory.style.borderTopRightRadius = '0px'
        firstCategory.style.borderTopLeftRadius = '0px'
      }
    }

  }.bind(this)

  this.createCategory = function(context, event) {
    const el = event.target
    const name = el.value

    if (name.length > 0) {
      // create a new dummy category and get a reference to its id
      const category = new Category({ name }, true)

      // update the DOM
      this.categories.unshift(category)

      // clear and hide input element
      el.value = ""
      this.canAdd(false)

      // update server
      $.post({
        url : '/categories/new',
        data : {
          name
        },
        success: successHandler.bind(this),
        dataType: 'json'
      })

      // success handler for AJAX POST request
      function successHandler(data) {
        // success message
        console.log(`Successfuly created "${data.name}" category on the server.`)

        // update the dummy category object with real data
        for (let key in data) category[key] = data[key]

        this.setFirstCategoryBorderRadius()
      }

    }
  }

  this.deleteCategory = function(id, context, event) {
    // handle event object
    this.inputClicked(context, event)

    // delete category object from DOM
    this.categories.remove(context)

    // remove category from server
    $.post({
      url : `/categories/${id}/delete`,
      data : {
        name
      },
      success: function(data) {
        // success message
        console.log(`Successfuly deleted ${data.name}" category on the server.`)
      },
      dataType: 'json'
    })

    this.setFirstCategoryBorderRadius()

  }.bind(this)

  this.inputClicked = function(context, event) {
    event.preventDefault()
    event.stopPropagation()
  }

}

export default CategoryList