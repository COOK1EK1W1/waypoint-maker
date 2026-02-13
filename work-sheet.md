# Optimsation algorithm


## Task 0 - Installation

For this tutorial, we're going to use waypoint maker as our testing ground. Waypoint Maker is a piece of software designed to make generating waypoint missions for unmanned ariel vehicles. To start we'll need to install some dependencies and clone the repository.

## 0.1 install bun

Refer to this site to (install bun)[https://bun.com/docs/installation]

## 0.2 clone the repository

`git clone https://github.com/COOK1EK1W1/waypoint-maker`

## 0.3 Open in vscode

Open the direcotry in vscode. VSCode will have the necessary extentions installed to have type safety whilst developing

## 0.4 Run waypoint maker

Run the following from `waypoint-maker` directory

`bun install` - this installs the typescript packages/dependencies of waypoint maker
`bun run dev` - this runs a development server and hosts the app on `http://localhost:3000`

if bun is not recognised, you may need to restart your terminal

## 0.5 Play around with dubins paths

Have a play around with the basic controls of waypoint maker. Clicking the map will place regular waypoints. clicking a waypoint will select it and display it's parameters at the bottom, you can select multiple waypoints on the right portion of the screen with shift.

These "Waypoints" are just basic waypoints and do not have the dubins path logic built into them. We can easily switch them to Dubins Waypoints by selecting each waypoint and changing it's type to "Dubins" from the bottom panel in the "Params" tab.

Once the waypoints have been changed to Dubins Waypoints, you'll see a red line between each of them, and the available parameters have changed in the bottom panel. Select one waypoint and play around with these parameters to see their affect on the path. (the parameter values are draggable !!)

## 0.6 not a task, but helpful info

The project is typescript, that means you can hover over symbols to show their type and description.
It also means you can use "go to definition" which may be useful to view the implementation of certain things.

You can debug certain parts by using `console.log("Hello world")` which will appear in the console on the browser ** not in the console where you ran bun run dev **



## Task 1 - Implement Serialisation functions

The first task is to take the dubins waypoints and extract their attributes into a form in which an optimisation algorithm can operate. 
At the same time we'll also want to ensure that the parameters are put back into the waypoints in an inverse operation.
We'll also want to create the bounds for the data. The bounds should be a parallel array with the extracted parameters and is passed to the optimisation algorithm.

The following functions can be found in `src/lib/dubinWaypoints.ts`

### 1.1 getTunableDubinsParameters

`getTunableDubinsParameters` should take in an array of dubins waypoints, and return the tunable parameters as an array of numbers.

### 1.2 setTunableDubinsParameter

`setTunableDubinsParameter` should take in an array of dubins waypoints as well as an array of numbers and apply those values to the waypoints

### 1.3 getBounds

`getBounds` should take in an array of dubins waypoints as well as a vehicle, and return an array of bounds.

### 1.4 Verification

Check your implementations works by running `bun test step-1` from the waypoint-maker directory




## Task 2 - Implement Fitness Function

Next we need to define some fitness functions so we can optimise the parameters of the dubins commands.
The optimisation algorithms we will be using are implemented to minimise the output of the fitness function. This means we should define our fitness functions to minimise some attribute, such as length

The following functions can be found in `src/components/waypointEditor/optimisation/optimisation.tsx`

### 2.1 pathLength

lets say we want to optimise for length, we can basic geometry to calculate the lengths of each of the sections

### 2.2 pathEnergy ( Optional )

If we want to optimise for energy, we can do the same as the length calculation, however weight each segment by its aerodynamic load factor.
The helper function `loadFactor(radius, velocity)` exists in `src/lib/dubins/geometry.ts` and can be used to calculate the load factor given a turn radius and velocity





## Task 3 - Particle Swarm Algorithm

We should now have everything we need to get started optimising the Dubins Paths! Its best to start with only a few waypoints so we can debug if we come accross any issues.

Heading to the optimisation tab in the bottom panel, you should see a few optimisation algorithms as well as the fitness functions you wrote earlier. (If not you may need to place some waypoints and change their type to Dubins Waypoints)

From here you can hit "Optimise" and the optimisation algorithm will run. In theory, this should have modified the parameters you chose in step 1.1 and 1.2 and changed them in a sensible manner.

### Hyper Parameter Tuning

The `src/lib/optimisation/` contains implementations for several optimisation algorithms. We can of course modify these implementations and specifically, modify their hyper parameters.

Within `particleSwarm.ts`, you can play around with parameters such as: popSize, cogWeight, socialWeight, friction, maxIterations.





## Task 4 - Optimise the tricky path

In the root of waypoint-maker you'll find `tricky.json` which is a few dubins points which should test your optimisation algorithms. You can load this mission by clicking the "Mission" button at the top of the screen and importing the json.

As a class we will compete to find the minimum length/energy of a path.
