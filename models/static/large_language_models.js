// models/static/large_language_models.js

document.addEventListener('DOMContentLoaded', () => {
  // ------------------ Elements ------------------
  // Provider form
  const addProviderForm = document.getElementById('addProviderForm');
  const providerNameInput = document.getElementById('providerName');
  const providerBaseUrlInput = document.getElementById('providerBaseUrl');
  const providerApiKeyInput = document.getElementById('providerApiKey');
  const providersTableBody = document.querySelector('#providersTable tbody');

  // Model form
  const addModelForm = document.getElementById('addModelForm');
  const modelNameInput = document.getElementById('modelName');
  const modelProviderSelect = document.getElementById('modelProviderSelect');
  const modelsTableBody = document.querySelector('#modelsTable tbody');

  // ------------------ On Page Load ------------------
  fetchProviders(); // populate providers table + modelProviderSelect
  fetchModels();    // populate models table

  // =====================================================
  // ================ PROVIDERS LOGIC ====================
  // =====================================================

  // Handle the "Add Provider" form submission
  // Handle the "Add Provider" form submission
  addProviderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = providerNameInput.value.trim();
    const base_url = providerBaseUrlInput.value.trim();
    const api_key = providerApiKeyInput.value.trim();

    // Debug: Log what data we are about to send
    console.log("[DEBUG] 'Add Provider' form submitted", { name, base_url, api_key });

    // Send POST request to create a new provider
    fetch('/models/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base_url, api_key })
    })
      .then(response => {
        // Debug: Log the fetch() response status and object
        console.log("[DEBUG] createProvider fetch response:", response);
        if (!response.ok) {
          throw new Error(`Error creating provider: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Debug: Log the response body
        console.log("[DEBUG] Provider creation result:", data);
        addProviderForm.reset();
        fetchProviders(); // refresh providers
      })
      .catch(err => {
        console.error("[DEBUG] Failed to create provider:", err);
        alert('Failed to create provider.');
      });
  });

  function fetchProviders() {
    fetch('/models/api/providers')
      .then(response => response.json())
      .then(providers => {
        // 1) Update providers table
        providersTableBody.innerHTML = '';
        providers.forEach(p => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border-b px-4 py-2">${p.id}</td>
            <td class="border-b px-4 py-2">${p.name}</td>
            <td class="border-b px-4 py-2">${p.base_url || ''}</td>
            <td class="border-b px-4 py-2">${p.api_key || ''}</td>
            <td class="border-b px-4 py-2">
              <button 
                class="bg-yellow-500 text-white px-2 py-1 rounded editProviderBtn" 
                data-id="${p.id}">
                Edit
              </button>
              <button 
                class="bg-red-500 text-white px-2 py-1 rounded ml-2 deleteProviderBtn"
                data-id="${p.id}">
                Delete
              </button>
            </td>
          `;

          // Handle Provider Delete
          const deleteBtn = row.querySelector('.deleteProviderBtn');
          deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this provider?')) {
              deleteProvider(p.id);
            }
          });

          // Handle Provider Edit
          const editBtn = row.querySelector('.editProviderBtn');
          editBtn.addEventListener('click', () => {
            const newName = prompt('Enter new provider name:', p.name);
            if (newName !== null) {
              const newBaseUrl = prompt('Enter new base URL:', p.base_url || '');
              if (newBaseUrl !== null) {
                const newApiKey = prompt('Enter new API key:', p.api_key || '');
                if (newApiKey !== null) {
                  updateProvider(p.id, newName, newBaseUrl, newApiKey);
                }
              }
            }
          });

          providersTableBody.appendChild(row);
        });

        // 2) Also update the <select> for "Add Model"
        updateProviderSelect(providers);
      })
      .catch(err => {
        console.error(err);
        alert('Error fetching providers');
      });
  }

  function updateProviderSelect(providers) {
    // Clear existing options
    modelProviderSelect.innerHTML = '';
    // Create an <option> for each provider
    providers.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `${p.name} (ID: ${p.id})`;
      modelProviderSelect.appendChild(option);
    });
  }

  function deleteProvider(providerId) {
    fetch(`/models/api/providers/${providerId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error deleting provider');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        fetchProviders();
        fetchModels(); // Because deleting a provider may affect models
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete provider.');
      });
  }

  function updateProvider(providerId, name, base_url, api_key) {
    fetch(`/models/api/providers/${providerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, base_url, api_key })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error updating provider');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        fetchProviders(); 
        fetchModels(); // In case provider data shown in the models table changes
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update provider.');
      });
  }

  // =====================================================
  // ================ MODELS LOGIC =======================
  // =====================================================

  // Handle the "Add Model" form submission
  addModelForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = modelNameInput.value.trim();
    const provider_id = modelProviderSelect.value;

    // Send POST request to create a new model
    fetch('/models/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, provider_id: parseInt(provider_id) })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error creating model');
        }
        return response.json();
      })
      .then(data => {
        console.log('Model created:', data);
        addModelForm.reset();
        fetchModels(); // refresh models
      })
      .catch(err => {
        console.error(err);
        alert('Failed to create model.');
      });
  });

  function fetchModels() {
    fetch('/models/api/models')
      .then(response => response.json())
      .then(models => {
        modelsTableBody.innerHTML = '';

        models.forEach(m => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border-b px-4 py-2">${m.id}</td>
            <td class="border-b px-4 py-2">${m.name}</td>
            <td class="border-b px-4 py-2">${m.provider_id}</td>
            <td class="border-b px-4 py-2">${m.provider.name}</td>
            <td class="border-b px-4 py-2">${m.provider.base_url || ''}</td>
            <td class="border-b px-4 py-2">${m.provider.api_key || ''}</td>
            <td class="border-b px-4 py-2">
              <button 
                class="bg-yellow-500 text-white px-2 py-1 rounded editModelBtn" 
                data-id="${m.id}">
                Edit
              </button>
              <button 
                class="bg-red-500 text-white px-2 py-1 rounded ml-2 deleteModelBtn"
                data-id="${m.id}">
                Delete
              </button>
            </td>
          `;

          // Handle Model Delete
          const deleteBtn = row.querySelector('.deleteModelBtn');
          deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this model?')) {
              deleteModel(m.id);
            }
          });

          // Handle Model Edit
          const editBtn = row.querySelector('.editModelBtn');
          editBtn.addEventListener('click', () => {
            const newName = prompt('Enter new model name:', m.name);
            if (newName !== null) {
              // We could also allow changing provider by prompting for a new provider ID
              // or reusing an existing provider. For simplicity:
              const newProviderId = prompt(
                `Enter new provider ID (current: ${m.provider_id}):`,
                m.provider_id
              );
              if (newProviderId !== null && newProviderId !== '') {
                updateModel(m.id, newName, parseInt(newProviderId));
              }
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

  function deleteModel(modelId) {
    fetch(`/models/api/models/${modelId}`, {
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

  function updateModel(modelId, name, provider_id) {
    fetch(`/models/api/models/${modelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, provider_id })
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