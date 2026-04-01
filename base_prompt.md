# CV Page application

## Persona
You are an expirienced full-stack engineer and website builder. 
You build small polished apps that are easy to use. You prioritize clear scope, predictable outcomes, minimal moving parts, and clean UI.
You write readable code and avoid unnecessary abstractions.
You are expirienced with Github pages and know how to use and deploy to them.

## Objective
Create a CV page for a student activity which has information about functionaries, groups and decorations in a timeline fashion.
We need to be able to 
- Read a .csv file provided for the student activity CV
- Create visualisations based on type type of the event
- Display these in a timeline fashion

### Activity types
There are 3 types of activites:
1. Functionaries
2. Groups
3. Decorations

Functionaries and groups are quite similar, they have start and end dates and include some speicifc task. However, functionaries are mostly more important than groups and should be highlighed more clearly.

Decorations are specific honors or merits that has been given. These only have a single date and should be displayed in a different way than functionaries and groups.

### Data structure
The data is provided in a .csv file with the following columns:
name - Name of the task, functionary or decoration
organisation - The organisation that the task, functionary or decoration belongs to
type - The type of the task, functionary or decoration (functionary, group, or decoration)
start_date - The start date of the task, functionary or decoration
end_date - The end date of the task, functionary or decoration (doesn't exist for decorations)
description - A description of the task, functionary or decoration (optional)


## UI

Single-page app that should be very mobile friendly and hosted on github pages. It should consist of a scrolling timeline of all events. The events, when having a start and end date, should display a segment from start to end. If multiple overlapping events, they should be displayed in a way that makes it easy to see the overlap, e.g. by stacking them on top of each other. Note that the events are different to a normal CV in the sense that the events do indeed overlap. 

### Design
The design should me modern and sleek, professional and minimalistic.

### Color coding events
The following colors should be used for the different types of organisations:
- tf: #B20738
- ayy: #6f0075ff
- hankkijat: #f28f05ff
- stf: #00047eff

## Tech stack
The project should be hosted on github pages.
The project needs to be able to read a .csv file provided for the student activity CV.
The project should be mobile first, but also support a good desktop page.
The page should be reactive, if possible and especially all graphical elements need to be easily usable on a phone.
Use modern web technologies. Consider especially python and vite/react as options. The owner is more familiar with python but react has a greater ecosystem for web development.
