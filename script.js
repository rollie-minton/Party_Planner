const newURL = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const cohortName = "/2109-CPU-RM-WEB-PT";
const API = newURL + cohortName;

// === State ===
const state = {
    parties: [],
    selectedParty: null,
};

const selectParty = (party) => {
    state.selectedParty = party;
    location.hash = party.id;
};

const partyByID = () => {
    const id = +location.hash.slice(1);
    state.selectedParty = state.parties.find((party) => party.id === id);
};

// Send Fetch parties request
const getParties = async () => {
    try {
        const response = await fetch(API + "/events");
        const parsed = await response.json();
        state.parties = parsed.data;
    } catch (err) {
        console.error(err);
    }
};

//Send POST request to API
const addParty = async () => {
    try {
        const $form = document.querySelector("form");
        const date = new Date($form.date.value).toISOString();
        
        await fetch(API + "/events", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( {
                name: $form.name.value,
                date,
                location: $form.location.value,
                description: $form.description.value,                                
            }),         
        });
    } catch (err) {
        console.error(err);
    }
};

// Delete selected party
const deleteParty = async () => {
    try {
        await fetch(`$(API)/events/${state.selectedParty.id}`, {
            method: "DELETE",
        });

        // Deselect newly deleted party
        state.selectedParty = null; 
    } catch (err) {
        console.error(err);
    }
};

// === Render Functions ===

// Render Parties

const renderParties = () => {
    const $partyList = document.querySelector("ul.parties");

    if (!state.parties.length) {
        $partyList.innerHTML = `
        <li>No parties near you :</li>
        `;
        return;
    }

    const $parties = state.parties.map((party) => {
        const $li = document.createElement("li");
        $li.textContent = `${party.name} #${party.id}`;

        $li.addEventListener("click", (_event) => {
            selectParty(party);
            renderSelectedParty();
        });
        return $li;
    });

    $partyList.replaceChildren(...$parties);
};

// Render Selected Party

const renderSelectedParty = () => {
    const $party = document.querySelector("article.party");

    if(!state.selectedParty) {
        $party.textContent = "Please click on party to see more info about it";
        return;
    }

    const date = new Date(state.selectedParty.date);

    $party.innerHTML = `
    <h2>${state.selectedParty.name} #${state.selectedParty.id}</h2>
    <datetime>${date}</datetime>
    <address>${state.selectedParty.location}</address>
    <p>${state.selectedParty.description}</p>
    <button>Delete Party</button>
    `;

    const deleteButton = $party.querySelector("button");
    deleteButton.addEventListener("click", async (_event) => {
        await deleteParty();
        await getParties();
        renderParties();
        renderSelectedParty();
    });
};

// === Script ===

const $form = document.querySelector("form");
$form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await addParty();
    await getParties();
    renderParties();
});

// Fetch parties and render them
const init = async () => {
    await getParties();
    renderParties();

    partyByID();
    renderSelectedParty();
};

window.addEventListener("load", init);