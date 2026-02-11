const contenedor = document.querySelector('.contenedorTarjetas');

fetch(`https://rickandmortyapi.com/api/character`)
  .then(res => res.json())
  .then(data => {
    const personajes = data.results;

    personajes.forEach(personaje => {
      const tarjeta = document.createElement('article');
      tarjeta.classList.add('tarjeta');

      tarjeta.innerHTML = `
        <img src="${personaje.image}">
        <h2>${personaje.name}</h2>
        <p>${personaje.status} - ${personaje.species}</p>
        <p>${personaje.gender}</p>
        <p>${personaje.origin.name}</p>
      `;

      contenedor.appendChild(tarjeta);

    });
  })
  .catch(error => {
    console.error('Error al cargar personajes:', error);
  });
