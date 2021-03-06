# Cerebral developer preview

I have been writing about React, Webpack, Flux and Flux like architectures for quite some time now. All these ideas and thoughts have been churning around in my head and after watching [this video](https://youtu.be/2HK4ENBPcWA) on how [Elm](http://elm-lang.org/) is able to control the state flow of your application everything just came together. I wanted to take what I have learned so far and build something that tries to solve all the challenges I have been writing about and at the same time bring something new to the table.

## Meet Cerebral

![People](/images/cerebral.png)

Cerebral is a framework. I call it a framework because it has the bare necessities of what you need to build an application. It provides concepts for handling application state and depends on React for its UI. Routing, http requests etc. are separate tools you choose based on what the project needs. Technically Cerebral does not need React to work, and there is an open issue for discussion on how Cerebral could be used with other frameworks: [Should Cerebral be independent of React?](https://github.com/christianalfoni/cerebral/issues/3)

**So why would you even consider Cerebral?** Before going into the thoughts behind Cerebral I want to point out that this is not another "FLUX framework" with its own take on actions, dispatchers and stores. I am certainly not talking down those frameworks, many of them are really great, but Cerebral is a new take on how to handle application state alltogether. It is inspired by Flux and more recent solutions like [Baobab](https://github.com/Yomguithereal/baobab). So big thanks to all the brilliant people working on tools to make web application development more fun than frustrating!

### Thinking Cerebral

> If your application was a person, Cerebral would be the brain and the nervous system of that person

I want to give you an analogy for building web applications. Think of your application as different people having different responsibilities. Maybe you have one person responsible for a form, an other for the main menu and a third person is responsible for a list. This translates to **views** in an application. So a **view** is basically a person with a brain (the state) and a nervous system (events), and the body would be the UI. The user interacts with the **view** in different ways and events are processed to change state which in turn changes the UI. We can go all the way back to [Backbone](http://www.backbonejs.org) for this type of behaviour.

![People](/images/people.png)

Though this seems like a good way to manage interaction and state, it does have its challenges. Imagine you are part of a development team of 5 people. It is very difficult to keep everyone in complete sync as interactions most often is "one to one". You might say something to one team member and later you realize that other team members should also be notified... but that is probably after something went wrong. This is the exact same problem with having multiple persons with their own brain and nervous system representing your application, or in web application terms, multiple views with their own state and event processing. You quickly loose control of communicating between them.

When FLUX and React came a long it basically said; *it is too complicated to have multiple persons representing your application, it should be one person, with one brain and one nervous system*. This translates to the brain being your stores and the dispatcher and actions being your nervous system. Indeed it is a lot easier to keep control of everything when there is only one person to blame, but the challenge with FLUX though is that this one person responsible for your application has a split personality. It is a single brain indeed, but that brain is divided into different sections... different stores. And these stores face similar problems as they depend on each other and requires complex logic to share and update state.

**So what makes Cerebral different?** Cerebral is truly "one person" in this analogy. It has one brain (one object) with the state of the application, but it shares even more with our human anatomy. Lets keep using the analogy with an example. When you burn your finger, what happens? Does your finger tell your brain to move your arm? No, your finger sends a "fingerHeated" impulse to your brain, your brain processes this impulse and when it reaches a certain level of heat it will put your brain in "move arm state" and the arm moves.

But let us now imagine that you burn your finger badly and it hurts, you do not just move your arm, you also scream. If your finger told your brain to move the arm, the finger would also tell the brain to scream. But you do not have just one finger, you probably have 10 fingers and all of them would have to "implement this logic". They would also have to keep the order correct, or you might scream before removing your arm burning your right hand fingers, but the opposite burning your left hand fingers. This is of course not how it works. The fingers just sends impulses and the brain processes these impulses which ultimately results in changed "state".

Cerebral has an implementation called **signals**. A signal is just like an impulse. It lets your components signal an interaction. This signal can be processed by multiple actions, but they all happen one after the other. So with our burned finger example you would always move your arm before screaming, or the opposite. The point is that it is consistent. A typical name for a signal in Cerebral is "inputChanged" or "formSubmitted". A signal indicates "what happened", not "what should happen". A good feature with signals is that they have functional benefits. You can add, remove, reuse and test actions very easily.

### What makes Cerebral so special
When writing a Cerebral app you should ideally not have any state at all in your components. Everything should be defined in **the cerebral**. This keeps Cerebral in complete control of your application state flow and this is an extremely powerful concept. First of all you get a strong concept of how to mutate state. Cerebral will actually throw an error if you try to mutate state outside a signal. You also have a strong concept of where to define the state, as a single object passed to the cerebral instance. 

Second Cerebral is able to analyze the state flow and exposes an API to use that information. An example of using this information is the **Cerebral Debugger**. When developing an application with Cerebral you are able to use a debugger that displays signals sent and mutations performed. But not only that, you can remember! Using a slider you are able to move back in time, always seeing what signal and mutations caused the current state. That is extremely powerful stuff. You can imagine this information could be used for a lot of different things. Like user support, user tracking, notifications etc. It will be exciting to see what developers come up with! Take a look at the following video to see how the debugger works: [Cerebral - The debugger](https://www.youtube.com/watch?v=Fo86aiBoomE).

A last thing to mention is that a signal runs between animation frames and automatically measures the time it takes to run all the mutations. It also measures the time it takes for your components to retrieve these state updates as an "update" event is triggered synchronously at the end of all signals. This is displayed in the debugger and makes it easy to get a grip on how your application performs. It is more predictable and performant to trigger an "update" event at the end of a signal rather than manually do so for each mutation, which is common in traditional FLUX architecture.

## Lets get into some code
All examples will be in ES6 syntax. Lets quickly review the files we are going to work in.

```javascript

components/
  App.js
actions/
  setInputValue.js
  addListItem.js
cerebral.js
main.js
```

And finally some code.

### Create a Cerebral
*cerebral.js*
```javascript

import Cerebral from 'cerebral';

let cerebral = Cerebral({
  inputValue: '',
  list: []
});

export default cerebral;
```

We have defined just a couple of state values for our application. The text in an input and a list. Our application will just add text to the list as you hit enter in the input.

### Create a component
*components/App.js*
```javascript

import React from 'react';
import mixin from 'cerebral/mixin';

let App = React.createClass({
  mixins: [mixin],
  getCerebralState() {
    return ['inputValue', 'list'];
  },
  onInputValueSubmitted(event) {
    event.preventDefault();
    this.signals.inputValueSubmitted();
  },
  onInputValueChanged(event) {
    this.signals.inputValueChanged(event.target.value);
  },
  renderListItem(item, index) {
    return <li key={index}>{item}</li>;
  },
  render() {
    return (
      <div>
        <form onSubmit={this.onInputValueSubmitted}>
          <input
            type="text"
            value={this.state.inputValue}
            onChange={this.onInputValueChanged}/>
        </form>
        <ul>
          {this.state.list.map(this.renderListItem)}
        </ul>
      </div>
    );
  }
});

export default App;
```

So this is a typical React component. What to notice here is that we do not import anything related to our cerebral instance, just a mixin. This is because the cerebral instance will be injected into the application and exposed on the context. This allows any component to hook on to the cerebral state, extract it and send signals to it. As you start to see now, Cerebral exists "inside" the body of the application, not outside it.

I would also like to mention that you can return an object from `getCerebralState()` instead. The keys will map to whatever key you want to use on the components state object and the value being the path to the state you want to extract from the cerebral instance.

### Inject the cerebral into the app
*main.js*
```javascript

import React from 'react';
import cerebral from './cerebral.js';
import App from './components/App.js';

import setInputValue from './actions/setInputValue.js';
import addListeItem from './actions/addListItem.js';

cerebral.signal('inputValueChanged', setInputValue);
cerebral.signal('inputValueSubmitted', addListItem);

let Wrapper = cerebral.injectInto(App);

React.render(<Wrapper/>, document.querySelector('#app'));
```
So we are doing two different things here. First of all we define the signals we are using in our App component. As you can see the naming is how you would name an impulse, "what happened", not "what should happen".

When injecting cerebral into the App component it will return a Wrapper. When not running in a production environment Cerebral will also insert the debugger into this wrapper. The debugger will show you the previous signal and the mutations done to the cerebral during that signal. The debugger also has a slider that lets you travel back in time and look at all signals and mutations done during the lifespan of the application.

### Creating actions
Your actions are run when the signal is received. They are run synchronously by default, but can also run asynchronously. The arguments passed to an action is the cerebral instance and any arguments passed with the signal. Whatever you return from an action will be passed to the next action, but beware, any objects will be frozen. You see, Cerebral runs in an immutable environment. Any state you extract from the cerebral can not be changed. This is what makes updates to the components so fast because there is no need for deep checking of changes. It also benefits Cerebrals ability to remember. You can not change the past, immutability makes sure of that.

*actions/setInputValue*
```javascript

let setInputValue = function (cerebral, value) {
  cerebral.set('inputValue', value);
};

export default setInputValue;
```
Cerebral has many different methods for mutating state. **set, push, concat, splice, merge, unset, pop** etc. The first argument of a mutation is always the path to the value you want to mutate. In the example above we use a string as we are changing the top level of the cerebral. For nested values you use an array. You can also pass retrieved state values as path to the mutation.

*actions/addListItem.js*
```javascript

let addListItem = function (cerebral) {
  cerebral.push('list', cerebral.get('inputValue'));
  cerebral.set('inputValue', '');
};

export default addListItem;
```
You get state from the cerebral using the `.get()` method. This takes a path, either a string or an array. As stated earlier these values are immutable, but you can easily make a mutable copy by running a `.toJS()` method on them.

You can also watch an introduction video of this, which shows the workflow using the debugger: [Cerebral - Building your first app](https://www.youtube.com/watch?v=ZG1omJek6SY).

## Complex state handling
So far Cerebral does not really bring much to the table other than a fancy debugger. Where it really starts to shine though is getting into complex state handling and asynchronous state handling.

### Asynchronous actions
One of the more difficult concepts to handle is asynchronous code. When Facebook intitially put FLUX into the wild there was a lot of discussions on where to put asynchronous code. In Cerebral you are not able to change state unless it is synchronously done from an action. So how do you change state with asynchronous code?

Let us imagine that the input value is the title of a todo and we want to send that todo to the server. As it is being sent we want to indicate on the todo that it is saving and we want to indicate that it has stopped saving when the server has responded. We also want to indicate any error. Let us create a signal first:

```javascript

cerebral.signal('inputValueSubmitted', addTodo, saveTodo, updateTodo);
```
And now let us create the actions.

```javascript

let addTodo = function (cerebral, title) {
  let todo = {
    $ref: cerebral.ref(),
    $isSaving: true,
    title: title,
    completed: false
  };
  cerebral.push('todos', todo);
  return todo;
};
```
We create the todo object and give it a cerebral reference. These references are used to lookup objects in the cerebral instance whenever needed. We also add a `$isSaving` property to the todo. This is a convention that fits well with Cerebral. All `$` properties are client side properties used to indicate the state of an object or its client reference. It is very handy indeed. Finally we push the todo into the cerebral and then return an object for the next action.

```javascript

import ajax from 'ajax';

let saveTodo = function (cerebral, todo) {
  return ajax.post('/todos', {
    title: todo.title,
    completed: todo.completed
  })
  .then(function () {
    return {
      $ref: todo.$ref,
      $isSaving: false
    };
  })
  .catch(function (error) {
    return {
      $ref: $todo.ref,
      $isSaving: false,
      $error: error
    };
  });
};
```
The first thing to notice here is that this imagined ajax library returns a **promise**. This is what indicates that an action is asynchronous. If a promise is returned it will wait for it to fulfill before it runs the next action in the signal. The resolved value will be passed as an argument. In this case we return an object with new/changed properties that we can merge.

But what about the debugger? It would not be a very good experience if you retraced your steps and these async actions would trigger new server requests. Well, they don't. Cerebral does not only remember the signals and mutations done, but also values returned from asynchronous actions. This means that when you look at previous state in the debugger it will all happen synchronously.

```javascript

let updateTodo = function (cerebral, updatedTodo) {
  let todo = cerebral.getByRef('todos', updatedTodo.$ref);
  cerebral.merge(todo, updatedTodo);
};
```
And the last action now grabs the todo from the cerebral and uses it as a path to merge in the updated properties. What to notice here is that the `updateTodo()` method is quite generic. There might be other signals that also requires updating of a todo. You can use the same function for that. Also notice that synchronous functions are pure functions. That makes them very easy to test. Just pass an instance of a Cerebral whan calling them and verify that they make the changes and/or returns the value you expect.

### Composing state
A different challenge with handling complex state is relational data. A typical example of this is that you load lots of data records, but only want to show some of them. You need one state for keeping the records and an other to indicate which ones to display. The best way to do this is using the id of the data record as a reference. But how do you expose the source data using this reference? Enough theory, lets see some code.

```javascript

let cerebral = Cerebral({
  projects: {},
  projectRows: []
});
```
So let us imagine that we have 100 projects in our projects map. The key of the project is its id. Now we want to show only 10 of them, but if anything changes in the projects map we want those changes also to show on the projects in the projectRows list. Let us first create a signal and an action that will populate the projectRows list.

```javascript

let populateProjectRows = function (cerebral) {
  let projects = cerebral.get('projects');
  projects = Object.keys(projects).filter(function (key, index) {
    return index < 10;
  });
  cerebral.set('projectRows', projects);
};

cerebral.signal('projectsTableOpened', populateProjectRows);
```
Our component will use the `projectRows` state, but it is filled up with ids, we want it to be filled up with projects. Lets go back to the cerebral and change our definition of `projectRows`.

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects'],
    get(cerebral, deps, ids) {
      return ids.map(function (id) {
        return deps.projects[id];
      });
    }
  };
};

let cerebral = Cerebral({
  projects: {},
  projectRows: projectRows
});
```
Cerebral is able to map a state value to a new value when its own or dependant state values change. You define this behaviour by returning an object. The object needs a **value** property which will be the initial value of the state. The **deps** property lets you point to other paths in the cerebral. Any changes on those paths will remap the state value using the last property, **get**. The first argument received in the **get()** method is the cerebral instance. You can use this to grab other state values and trigger signals. The second argument is the values of the depending state. As stated above, if anything changes on the source data we want it to be updated. The last argument is the value of the state itself, in this case an array.

### Even more complex state
So lets take this a step further. What if the projects has an authorId that references a specific user? Maybe we can use our map to merge in that information?

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects', 'users'],
    get(cerebral, deps, ids) {

      return ids.map(function (id) {
        let project = deps.projects[id].toJS(); // Lets us mutate the project
        project.author = deps.users[project.authorId];
        return project;
      });

    }
  };
};
```

But we can make this even more complex. What if the user is not in the client? Lets take a look at what we can do about that.

```javascript

let projectRows = function () {
  return {
    value: [],
    deps: ['projects', 'users'],
    get(cerebral, deps, ids) {

      let missingAuthors = [];
      let projectRows = ids.map(function (id) {
        
        let project = deps.projects[id].toJS();
        project.author = deps.users[project.authorId];
        
        if (!project.author) {
          project.author = {
            $isLoading: true
          };
          missingAuthors.push(project.authorId);
        }
        
        return project;
      });

      if (missingAuthors.length) {
        cerebral.signals.missingAuthors(missingAuthors);
      }

      return projectRows;

    }
  };
};
```

I think this is one of the more complex situations of state handling we can meet as developers. Lets just go through that step by step:

1. The *get* method has access to the projects and users on the deps object
2. It prepares an array where missing author ids can be listed
3. When an author is not found a temporary object is created to indicate the state of that data. Then the id of the author is pushed into the missing authors array
4. When the projectRows are created the *get* method checks if there are any missing authors and passes those on a signal that will most certainly do an ajax request fetching the users and inserting them into the *users* map. This will in turn run the *get* method again and now the data is available

## Summary
I hope this article gave you insight into what Cerebral is all about. The project is currently not running on any applications in production, but I was hoping you would want to try it out, give feedback and help me bring it to a stable release. I think we are just scratching the surface of what we are able to do when the framework has complete control of the state flow. It is pretty amazing to use the debugger when developing because you avoid retracing your steps all the time, and as your application grows you always have a good overview of how the state flows. I can not wait to see what new ideas might show up using Cerebrals ability to understand the state flow!

You can check out the project and documentation at the [cerebral repo](https://github.com/christianalfoni/cerebral). It will guide you with introduction videos and a webpack boilerplate. 