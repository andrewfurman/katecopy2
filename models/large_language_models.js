 // this job script will have calls to the model in points in order to add edit or delete the name, hosting URL and API key for a large language model

// models/large_language_models.js

document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('addForm');
  const modelsTableBody = document.querySelector('#modelsTable tbody');

  // Load existing models on page load
  fetchModels();

  // Handle the "Add Model" form submission
  addForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('modelName').value.trim();
    const base_url = document.getElementById('baseUrl').value.trim();
    const api_key = document.getElementById('apiKey').value.trim();

    // Send POST request to create a new model
    fetch('/models/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base_url, api_key })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error creating model');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        // Reset the form
        addForm.reset();
        // Refresh table
        fetchModels();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to create model.');
      });
  });

  // Fetch all models and update the table
  function fetchModels() {
    fetch('/models/api')
      .then(response => response.json())
      .then(models => {
        // Clear existing rows
        modelsTableBody.innerHTML = '';

        // Populate table rows
        models.forEach(m => {
          const row = document.createElement('tr');

          row.innerHTML = `
            <td class="border-b px-4 py-2">${m.id}</td>
            <td class="border-b px-4 py-2">${m.name}</td>
            <td class="border-b px-4 py-2">${m.base_url || ''}</td>
            <td class="border-b px-4 py-2">${m.api_key || ''}</td>
            <td class="border-b px-4 py-2">
              <button 
                class="bg-yellow-500 text-white px-2 py-1 rounded editBtn" 
                data-id="${m.id}">
                Edit
              </button>
              <button 
                class="bg-red-500 text-white px-2 py-1 rounded ml-2 deleteBtn"
                data-id="${m.id}">
                Delete
              </button>
            </td>
          `;

          // Handle Delete
          const deleteBtn = row.querySelector('.deleteBtn');
          deleteBtn.addEventListener('click', () => {
            deleteModel(m.id);
          });

          // Handle Edit
          const editBtn = row.querySelector('.editBtn');
          editBtn.addEventListener('click', () => {
            const newName = prompt('Enter new name:', m.name);
            if (newName !== null) {
              const newBaseUrl = prompt('Enter new base URL:', m.base_url || '');
              const newApiKey = prompt('Enter new API key:', m.api_key || '');
              updateModel(m.id, newName, newBaseUrl, newApiKey);
            }
          });

          modelsTableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error(err);
        alert('Error fetching models');
      });
  }

  // Delete a model by ID
  function deleteModel(modelId) {
    fetch(`/models/api/${modelId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error deleting model');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        fetchModels(); // Refresh the table
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete model.');
      });
  }

  // Update a model by ID
  function updateModel(modelId, name, base_url, api_key) {
    fetch(`/models/api/${modelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base_url, api_key })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error updating model');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        fetchModels(); // Refresh the table
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update model.');
      });
  }
});