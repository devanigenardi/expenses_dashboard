import React, { useState } from 'react';
import './App.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function App() {
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [newTripName, setNewTripName] = useState('');

  // Función para agregar un nuevo viaje con un nombre personalizado
  const addNewTrip = () => {
    if (!newTripName.trim()) {
      alert('Por favor, ingresa un nombre para el viaje.');
      return;
    }
    const newTrip = {
      id: Date.now(),
      name: newTripName,
      entries: [],
    };
    setTrips([...trips, newTrip]);
    setActiveTripId(newTrip.id);
    setNewTripName(''); // Limpiar el campo de entrada
  };

  // Función para agregar una nueva fila de gastos al viaje activo
  const addRowToActiveTrip = () => {
    setTrips(trips.map(trip => {
      if (trip.id === activeTripId) {
        const newEntry = {
          id: Date.now(),
          date: '',
          activity: '',
          amount: '',
          numberOfPeople: 2, // Por defecto dividido entre dos
          dividedAmount: '',
        };
        return { ...trip, entries: [...trip.entries, newEntry] };
      }
      return trip;
    }));
  };

  // Función para eliminar una fila de gastos del viaje activo
  const removeRowFromActiveTrip = (entryId) => {
    setTrips(trips.map(trip => {
      if (trip.id === activeTripId) {
        return { ...trip, entries: trip.entries.filter(entry => entry.id !== entryId) };
      }
      return trip;
    }));
  };

  // Calcular totales para el viaje activo
  const activeTrip = trips.find(trip => trip.id === activeTripId);
  const totalAmount = activeTrip?.entries.reduce((acc, entry) => acc + parseFloat(entry.amount || 0), 0) || 0;
  const totalDividedAmount = activeTrip?.entries.reduce((acc, entry) => acc + parseFloat(entry.dividedAmount || 0), 0) || 0;

  return (
    <div className="App">
      <div className="App-header">
        <h1>Itinerario de Viajes</h1>
        <div className="dashboard-main">
        <TextField
            label="Nombre del nuevo viaje" // Etiqueta para el campo
            variant="outlined" // Estilo del campo (puede ser 'outlined', 'filled', o 'standard')
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            fullWidth // Ocupa el ancho completo del contenedor
          />
          <Button className="add-trip" onClick={addNewTrip}>Agregar Nuevo Viaje</Button>
          <div className="tabs">
            {trips.map(trip => (
              <Button
                key={trip.id}
                className={`tab ${trip.id === activeTripId ? 'active' : ''}`}
                onClick={() => setActiveTripId(trip.id)}
              >
                {trip.name}
              </Button>
            ))}
          </div>
          {activeTrip && (
            <>
              <Button className="add-row" onClick={addRowToActiveTrip}>Agregar gastos!</Button>
              <div className="dashboard-entries">
                {activeTrip.entries.map(entry => (
                  <div key={entry.id} className="entry-row">
                    <TextField
                      type="date"
                      label="Fecha"
                      variant="outlined"
                      className="custom-select"
                      value={entry.date}
                      onChange={(e) =>
                        setTrips(trips.map(trip =>
                          trip.id === activeTripId ? {
                            ...trip,
                            entries: trip.entries.map(item =>
                              item.id === entry.id ? { ...item, date: e.target.value } : item
                            )
                          } : trip
                        ))
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                    <Select
                    value={entry.activity}
                    onChange={(e) =>
                      setTrips(trips.map(trip =>
                        trip.id === activeTripId ? {
                          ...trip,
                          entries: trip.entries.map(item =>
                            item.id === entry.id ? { ...item, activity: e.target.value } : item
                          )
                        } : trip
                      ))
                    }
                    displayEmpty
                    fullWidth
                    variant="outlined"
                    className="custom-select"

                  >
                    <MenuItem value="">
                      <em>Tipo de gasto</em>
                    </MenuItem>
                    <MenuItem value="Hotel">Hotel</MenuItem>
                    <MenuItem value="Carro">Carro</MenuItem>
                    <MenuItem value="Comida">Comida</MenuItem>
                    <MenuItem value="Gasolina">Gasolina</MenuItem>
                    <MenuItem value="Avion">Avion</MenuItem>
                  </Select>

                  <TextField
                    type="number"
                    label="Monto ($)"
                    variant="outlined"
                    value={entry.amount}
                    onChange={(e) =>
                      setTrips(trips.map(trip =>
                        trip.id === activeTripId ? {
                          ...trip,
                          entries: trip.entries.map(item =>
                            item.id === entry.id ? { ...item, amount: e.target.value, dividedAmount: (e.target.value / item.numberOfPeople).toFixed(2) } : item
                          )
                        } : trip
                      ))
                    }
                    fullWidth
                  />

                  <TextField
                    type="number"
                    label="Dividir entre"
                    variant="outlined"
                    value={entry.numberOfPeople}
                    onChange={(e) =>
                      setTrips(trips.map(trip =>
                        trip.id === activeTripId ? {
                          ...trip,
                          entries: trip.entries.map(item =>
                            item.id === entry.id ? { ...item, numberOfPeople: e.target.value, dividedAmount: (item.amount / e.target.value).toFixed(2) } : item
                          )
                        } : trip
                      ))
                    }
                    fullWidth
                  />

                  <TextField
                    type="text"
                    label="Dividido entre"
                    variant="outlined"
                    value={`$${entry.dividedAmount}`}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />

                  <Button
                    className='remove-row'
                    variant="contained"
                    color="secondary"
                    onClick={() => removeRowFromActiveTrip(entry.id)}
                  >
                    X
                  </Button>

                  </div>
                ))}
              </div>
              <div className="dashboard-totals">
                <p>Monto total: ${totalAmount.toFixed(2)}</p>
                <p>Monto divido: ${totalDividedAmount.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
