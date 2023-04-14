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

// default variables
let todos = [];
let dragSrcEl = null;
let selectedElement = null;
let todosLS = getItemFromLS("todos");
let todosCountEl = document.getElementById("todos-count");
let themeLS = getItemFromLS("theme");
let theme;
let inputCompleted = false;
let toggleThemeImgEl = document.getElementById("toggle-btn-icon");
let prevDeleteId = "";
let sourceItemId;
let targetItemId;

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
    showAllTodos(document.getElementById("all-todos"));
    setTodosCountAndNoTodosContainer();
  }
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
  setTodosCountAndNoTodosContainer();
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
  setTodosCountAndNoTodosContainer();
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
  setTodosCountAndNoTodosContainer();
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
  document.body.classList.add("theme-animate");
  setTimeout(() => {
    document.body.classList.remove("theme-animate");
  }, 200);
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

// monitor theme change at browser level
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function (e) {
    theme = e.matches ? "moon" : "sun";
    setTheme(theme);
  });

// sortable setup
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
  }
);

// set sourceItemId, targetItemId values
sortable.on("sortable:sort", (e) => {
  try {
    sourceItemId = e.data.source.id;
    targetItemId = e.data.over.id;
  } catch (error) {}
});

// swap todos
sortable.on("sortable:sorted", (e) => {
  let arrIndex1 = todos.findIndex((todo) => todo.id == sourceItemId);
  let arrIndex2 = todos.findIndex((todo) => todo.id == targetItemId);
  let tempArrVal = todos[arrIndex1];
  todos[arrIndex1] = todos[arrIndex2];
  todos[arrIndex2] = tempArrVal;
  setItemToLS("todos", todos);
});

// perform on load setup
const onLoadSetup = () => {
  // check if todos already set in local storage
  if (todosLS) {
    todos = JSON.parse(todosLS);
    todos.map((todo) => {
      addTodo(true, todo.id, todo.value, todo.completed);
    });
  } else {
    console.log(
      "no todos are found in Local Storage, adding some todos for testing"
    );
    addNoTodosContainer();
  }
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
  // set todos count on page load
  setTodosCountAndNoTodosContainer();
};

// call on load setup
onLoadSetup();
