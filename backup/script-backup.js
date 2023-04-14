// get a random number
const getRandomNumber = () => {
  return Math.floor(Math.random() * 1000000 + 1);
};

// get todos from local storage
const getItemFromLS = (item) => {
  return window.localStorage.getItem(item);
};

// set items to local storage
const setItemToLS = (item, value) => {
  window.localStorage.setItem(item, JSON.stringify(value));
};

// delete todo from local storage
const deleteTodoFromLS = (index) => {
  todos.splice(index, 1);
};

let todos = [];
let dragSrcEl = null;
let selectedElement = null;
let todosLS = getItemFromLS("todos");
let todosCountEl = document.getElementById("todos-count");
let themeLS = getItemFromLS("theme");
let theme;
// let theme = "sun";
let inputCompleted = false;
let toggleThemeImgEl = document.getElementById("toggle-btn-icon");
let prevDeleteId = "";
let sourceItemId;
let targetItemId;
// create drag and drop functions
function handleDragStart(e) {
  setTimeout(() => {
    selectedElement = e.target;
    selectedElement.classList.add("selected");
  }, 100);
  this.style.opacity = "0.5";

  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  this.classList.add("over");
  e.dataTransfer.dropEffect = "move";

  return false;
}
function handleDragEnter(e) {
  this.classList.add("over");
}
function handleDragLeave(e) {
  this.classList.remove("over");
}
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  if (dragSrcEl != this) {
    //swap the ids of elements
    temp = this.id;
    this.id = dragSrcEl.id;
    dragSrcEl.id = temp;
    //swap the elements on user interface
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData("text/html");
    this.classList.add("selected");
    setTimeout(() => {
      this.classList.remove("selected");
    }, 100);
    //swap the elements in local storage
    let arrIndex1 = todos.findIndex((todo) => todo.id == this.id);
    let arrIndex2 = todos.findIndex((todo) => todo.id == dragSrcEl.id);
    let tempArrVal = todos[arrIndex1];
    todos[arrIndex1] = todos[arrIndex2];
    todos[arrIndex2] = tempArrVal;
    setItemToLS("todos", todos);
  }
  return false;
}
function handleDragEnd(e) {
  this.style.opacity = "1";
  items.forEach(function (item) {
    selectedElement.classList.remove("selected");
    item.classList.remove("over");
  });
}

//add drag and drop listeners
const addDragAndDropListeners = (item) => {
  item.addEventListener("dragstart", handleDragStart, false);
  item.addEventListener("dragenter", handleDragEnter, false);
  item.addEventListener("dragover", handleDragOver, false);
  item.addEventListener("dragleave", handleDragLeave, false);
  item.addEventListener("dragend", handleDragEnd, false);
  item.addEventListener("drop", handleDrop, false);
};

// remove todo from user interface
const removeTodoFromUI = (id) => {
  try {
    const todoToDeleteEL = document.getElementById(id);
    todoToDeleteEL.remove();
  } catch (error) {
    // element not found on user interface
  }
};

// add active status for button
const addActiveClass = (e) => {
  let buttons = document.querySelectorAll(".todo-options .btn");
  buttons.forEach((button) => {
    button.classList.remove("btn-active");
  });
  e.classList.add("btn-active");
};

// add todo
const addTodo = (append, id, text, completed) => {
  if (document.getElementById("noTodosContainer")) {
    removeNoTodosContainer();
  }
  if (id == 0) {
    id = getRandomNumber();
  }
  let btnClass = "btn-img btn-check";
  let imgClass = "check-icon hidden";
  let textClass = "todo-text";
  if (completed == true) {
    btnClass = "btn-img btn-check btn-checked";
    imgClass = "check-icon hidden checked";
    textClass = "todo-text complete";
  }
  let itemsContainerEL = document.querySelector(".todo-list");
  let todoEl = document.createElement("div");
  todoEl.classList.add("todo-item");
  // todoEl.addEventListener("focusin", showDeleteIcon);
  todoEl.setAttribute("draggable", true);
  todoEl.setAttribute("id", id);
  todoEl.innerHTML = `
    <div class="todo-left">
      <div class="btn-check-container">
      <button class="${btnClass}" onclick="markTodo(this)" id="create-${id}">
        <img
          class="${imgClass}"
          src="./images/icon-check.svg"
          alt="check icon"
        />
      </button>
      </div>
      <p class="${textClass}">
        ${text}
      </p>
    </div>
    <button 
      class="todo-right btn-img btn-delete"
      onclick="deleteTodo(this)" id="delete-${id}">
      <img
        class="delete-icon"
        src="./images/icon-cross.svg"
        alt="delete icon"
      />
    </button>
    `;
  if (!append) {
    itemsContainerEL.prepend(todoEl);
    todos.unshift({
      id: id,
      value: text,
      completed: completed,
    });
    // remove todo classes
    let createButtonEl = document.getElementById("create-btn");
    createButtonEl.classList.remove("btn-checked");
    createButtonEl.childNodes[1].classList.remove("checked");
    inputCompleted = false;
    // addDragAndDropListeners(todoEl);
    setItemToLS("todos", todos);
  } else {
    itemsContainerEL.append(todoEl);
  }
};

// create todo
const createTodo = (e) => {
  let inputEl = document.getElementById("new-todo");
  if (inputEl.value != "" && e.key == "Enter") {
    addTodo(false, 0, inputEl.value, inputCompleted);
    inputEl.value = "";
    // inputEl.blur();
  }
  setTodosCountAndNoTodosContainer();
};

// delete todo
const deleteTodo = (e) => {
  const id = e.parentNode.id;
  const index = todos.findIndex((todo) => todo.id == id);
  removeTodoFromUI(id);
  deleteTodoFromLS(index);
  setItemToLS("todos", todos);
  setTodosCountAndNoTodosContainer();
};

// show delete icon on focussing check using keyboard
const showDeleteIcon = (e) => {
  if (
    !e.srcElement.id.includes("create") &&
    !e.srcElement.id.includes("delete")
  ) {
    let deleteId = "delete-" + e.srcElement.id;
    if (prevDeleteId == "") {
      const deleteIconEl = document.getElementById(deleteId);
      deleteIconEl.style.visibility = "visible";
    } else {
      const deleteIconEl = document.getElementById(deleteId);
      deleteIconEl.style.visibility = "visible";
      const prevDeleteIconEl = document.getElementById(prevDeleteId);
      prevDeleteIconEl.style.visibility = "hidden";
    }
    prevDeleteId = deleteId;
  }
};

// toggle todo completion status
const markTodo = (e) => {
  let completed = false;

  // set completed variable
  if (!e.classList.contains("btn-checked")) {
    completed = true;
  }
  // toggle todo classes
  e.classList.toggle("btn-checked");
  e.childNodes[1].classList.toggle("checked");
  e.parentNode.parentNode.childNodes[3].classList.toggle("complete");

  // set todo as complete/incomplete
  const id = e.parentNode.parentNode.parentNode.id;
  todos = todos.map((todo) => {
    if (todo.id == id) {
      return { ...todo, completed: completed };
    } else {
      return todo;
    }
  });
  setItemToLS("todos", todos);
  setTodosCountAndNoTodosContainer();
};

// toggle input todo completion status
const markInputTodo = (e) => {
  // set completed variable
  if (!e.classList.contains("btn-checked")) {
    inputCompleted = true;
  } else {
    inputCompleted = false;
  }
  // toggle todo classes
  e.classList.toggle("btn-checked");
  e.childNodes[1].classList.toggle("checked");
};

// remove todos from user interface
const removeTodosFromUI = () => {
  let itemsContainerEL = document.querySelector(".todo-list");
  itemsContainerEL.innerHTML = "";
};

// delete completed todos
const deleteCompletedTodos = (e) => {
  //delete completed todos from LS
  todos = todos.filter((todo) => {
    if (todo.completed == true) {
      removeTodoFromUI(todo.id);
      return false;
    } else {
      return true;
    }
  });
  setItemToLS("todos", todos);
  setTodosCountAndNoTodosContainer();
};

//show all todos
const showAllTodos = (e) => {
  removeTodosFromUI();
  todos.map((todo) => {
    addTodo(true, todo.id, todo.value, todo.completed);
  });
  addActiveClass(e);
};

//show active todos
const showActiveTodos = (e) => {
  removeTodosFromUI();
  todos.map((todo) => {
    if (!todo.completed) {
      addTodo(true, todo.id, todo.value, todo.completed);
    }
  });
  addActiveClass(e);
};

//show completed todos
const showCompletedTodos = (e) => {
  removeTodosFromUI();
  todos.map((todo) => {
    if (todo.completed) {
      addTodo(true, todo.id, todo.value, todo.completed);
    }
  });
  addActiveClass(e);
};

// toggle theme icon
const toggleThemeIcon = () => {
  if (theme == "moon") {
    toggleThemeImgEl.src = `./images/icon-sun.svg`;
  } else {
    toggleThemeImgEl.src = `./images/icon-moon.svg`;
  }
};

// toggle theme
const toggleTheme = () => {
  if (theme == "moon") {
    theme = "sun";
    document.documentElement.setAttribute("data-theme", "");
    setItemToLS("theme", theme);
  } else {
    theme = "moon";
    document.documentElement.setAttribute("data-theme", "dark");
    setItemToLS("theme", theme);
  }
  toggleThemeIcon();
};

// set theme
const setTheme = (theme) => {
  if (theme == "moon") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "");
  }
  toggleThemeIcon();
  setItemToLS("theme", theme);
};

const addNoTodosContainer = () => {
  let itemsContainerEL = document.querySelector(".todo-list");
  let noTodosContainerEl = document.createElement("div");
  noTodosContainerEl.setAttribute("id", "noTodosContainer");
  noTodosContainerEl.classList.add("noTodosContainer");
  noTodosContainerEl.innerHTML = `<p>No Todos found</p><p>Add some Todos</p>`;
  itemsContainerEL.append(noTodosContainerEl);
};

const removeNoTodosContainer = () => {
  if (document.getElementById("noTodosContainer")) {
    document.getElementById("noTodosContainer").remove();
  }
};

const setNoTodosContainer = () => {
  if (todos.length <= 0 && !document.getElementById("noTodosContainer")) {
    addNoTodosContainer();
  }
};

// check if todos already set in local storage
if (todosLS) {
  todos = JSON.parse(todosLS);
  console.log(todos);
  // if (todos.length == 0) {
  //   console.log("if");
  //   addNoTodosContainer();
  // } else {
  // console.log("else");
  todos.map((todo) => {
    addTodo(true, todo.id, todo.value, todo.completed);
  });
  // }
} else {
  console.log(
    "no todos are found in Local Storage, adding some todos for testing"
  );
  addNoTodosContainer();
  // todos.unshift(
  //   {
  //     id: getRandomNumber(),
  //     value: "Complete online JavaScript course",
  //     completed: true,
  //   },
  //   {
  //     id: getRandomNumber(),
  //     value: "Jog around the park 3x",
  //     completed: false,
  //   },
  //   {
  //     id: getRandomNumber(),
  //     value: "10 minutes meditation",
  //     completed: false,
  //   },
  //   {
  //     id: getRandomNumber(),
  //     value: "Read for 1 hour",
  //     completed: false,
  //   },
  //   {
  //     id: getRandomNumber(),
  //     value: "Pick up groceries",
  //     completed: false,
  //   },
  //   {
  //     id: getRandomNumber(),
  //     value: "Complete Todo App on Frontend Mentor",
  //     completed: false,
  //   }
  // );
  // setItemToLS("todos", todos);
}

// add drag and drop functions to todos
let items = document.querySelectorAll(".todo-item");
items.forEach(function (item) {
  // addDragAndDropListeners(item);
});

// set todos count
const setTodosCount = () => {
  let todosLeft = todos.filter((todo) => {
    if (todo.completed == true) {
      return false;
    } else {
      return true;
    }
  });
  todosCountEl.innerText = todosLeft.length;
};

// set todos count and no todos container
const setTodosCountAndNoTodosContainer = () => {
  setTodosCount();
  setNoTodosContainer();
};

// check if theme is already set in local storage
if (themeLS) {
  theme = JSON.parse(themeLS);
  setTheme(theme);
} else {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    theme = "moon";
    setTheme("moon");
  } else {
    theme = "sun";
    setTheme("sun");
  }
}

// monitor theme change at browser level
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function (e) {
    theme = e.matches ? "moon" : "sun";
    setTheme(theme);
  });

// set todos count on page load
setTodosCountAndNoTodosContainer();

// const swappable = new Swappable(document.querySelectorAll("ul"), {
//   draggable: "li",
// });

// const customSensor = new Draggable.Sensors.TouchSensor(
//   document.querySelectorAll(".todo-list"),
//   {
//     mouse: 1000,
//     drag: 1000,
//     touch: 1000,
//   }
// );
// customSensor.currentScrollableParent = document.querySelectorAll(".todo-list");

const sortable = new Draggable.Sortable(
  document.querySelectorAll(".todo-list"),
  {
    draggable: ".todo-item",
    delay: 200,
    mirror: {
      constrainDimensions: true,
    },
    sortAnimation: {
      duration: 200,
      easingFunction: "ease-in-out",
    },
    plugins: [Draggable.Plugins.ResizeMirror, Draggable.Plugins.SortAnimation],
    classes: {
      "sortable:swapped": ["draggable--over", "draggable-mirror"],
    },
    // exclude: {
    //   plugins: [Draggable.Plugins.Focusable],
    //   sensors: [customSensor],
    // },
  }
);

// let swappableSwappedEvent = new Draggable.SwappableSwappedEvent();
sortable.on("sortable:start", (e) => {
  // console.log("sortable:start");
});
sortable.on("sortable:sort", (e) => {
  // console.log("sortable:sort");
  try {
    sourceItemId = e.data.source.id;
    targetItemId = e.data.over.id;
  } catch (error) {}
});
sortable.on("sortable:sorted", (e) => {
  // console.log(sourceItemId, targetItemId);
  let arrIndex1 = todos.findIndex((todo) => todo.id == sourceItemId);
  let arrIndex2 = todos.findIndex((todo) => todo.id == targetItemId);
  let tempArrVal = todos[arrIndex1];
  todos[arrIndex1] = todos[arrIndex2];
  todos[arrIndex2] = tempArrVal;
  setItemToLS("todos", todos);
  // console.log("sortable:sorted");
});
sortable.on("sortable:stop", (e) => {
  // console.log("sortable:stop");
});
// sortable.on("drag:start", (e) => {
//   console.log("drag:start");
// });
