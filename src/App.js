import React, { useState, useEffect } from 'react';
import './App.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";


import { db } from "./firebaseConfig";
console.log('Firebase configurado correctamente:', db);

function App() {
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [newTripName, setNewTripName] = useState('');

  const fetchTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const fetchedTrips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(fetchedTrips);
    } catch (e) {
      console.error("Error al obtener los viajes: ", e);
    }
  };

  // Llamar a fetchTrips cuando el componente se monte
  useEffect(() => {
    fetchTrips();
  }, []);

  // Función para agregar un nuevo viaje con un nombre personalizado
  const addNewTrip = async () => {
    if (!newTripName.trim()) {
      alert('Por favor, ingresa un nombre para el viaje.');
      return;
    }
    try {
      const newTrip = {
        name: newTripName,
        entries: [],
        createdAt: new Date() // Puedes almacenar la fecha de creación
      };
      // Agregar el nuevo viaje a la colección "trips" en Firestore
      const docRef = await addDoc(collection(db, "trips"), newTrip);
      // Actualizar el estado local con el nuevo viaje, usando el ID generado por Firestore
      setTrips([...trips, { ...newTrip, id: docRef.id }]);
      // Establecer el viaje recién agregado como el viaje activo
      setActiveTripId(docRef.id);
      // Limpiar el campo de entrada para el nombre del nuevo viaje
      setNewTripName('');
    } catch (e) {
      console.error("Error al agregar el viaje: ", e);
    }
  };

  const removeTrip = async (tripId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este viaje?")) {
      try {
        // Eliminar el viaje de Firestore
        await deleteDoc(doc(db, "trips", tripId));
        // Actualizar el estado local para eliminar el viaje
        setTrips(trips.filter(trip => trip.id !== tripId));
        // Deseleccionar el viaje si era el activo
        if (activeTripId === tripId) {
          setActiveTripId(null);
        }
      } catch (e) {
        console.error("Error al eliminar el viaje: ", e);
      }
    }
  };
  

  // Función para agregar una nueva fila de gastos al viaje activo
  const addRowToActiveTrip = async () => {
    if (!activeTripId) {
      alert("Selecciona un viaje primero.");
      return;
    }
    try {
      const newEntry = {
        id: Date.now(),
        date: '',
        activity: '',
        amount: '',
        numberOfPeople: 2, // Por defecto dividido entre dos
        dividedAmount: '',
      };
      
      // Actualizar el viaje activo en Firestore para agregar el nuevo gasto
      const tripRef = doc(db, "trips", activeTripId);
      await updateDoc(tripRef, {
        entries: [...activeTrip.entries, newEntry]
      });
      
      // Actualizar el estado local para reflejar el nuevo gasto
      setTrips(trips.map(trip =>
        trip.id === activeTripId ? {
          ...trip,
          entries: [...trip.entries, newEntry]
        } : trip
      ));
    } catch (e) {
      console.error("Error al agregar el gasto: ", e);
    }
  };
  

  // Función para eliminar una fila de gastos del viaje activo
  const removeRowFromActiveTrip = async (entryId) => {
    if (!activeTripId) {
      alert("Selecciona un viaje primero.");
      return;
    }
    try {
      // Actualizar el estado local para eliminar la entrada de gasto
      setTrips(trips.map(trip =>
        trip.id === activeTripId ? {
          ...trip,
          entries: trip.entries.filter(entry => entry.id !== entryId)
        } : trip
      ));
      
      // Eliminar la entrada de gasto en Firestore
      const tripRef = doc(db, "trips", activeTripId);
      await updateDoc(tripRef, {
        entries: trips.find(trip => trip.id === activeTripId).entries.filter(entry => entry.id !== entryId)
      });
    } catch (e) {
      console.error("Error al eliminar la entrada de gasto: ", e);
    }
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
            <div key={trip.id} className="trip-tab">
              <Button
                className={`tab ${trip.id === activeTripId ? 'active' : ''}`}
                onClick={() => setActiveTripId(trip.id)}
              >
                {trip.name}
              </Button>
              <Button
                className="remove-trip"
                variant="contained"
                color="secondary"
                onClick={() => removeTrip(trip.id)}
              >
                X
              </Button>
            </div>
          ))}
        </div>

          {activeTrip && (
            <>
              <Button className="add-row" onClick={addRowToActiveTrip}>Agregar gastos $</Button>
              <div className="dashboard-entries">
                {activeTrip.entries.map(entry => (
                  <div key={entry.id} className="entry-row">
                    <TextField
                      type="date"
                      label="Fecha"
                      variant="outlined"
                      className="custom-select"
                      value={entry.date}
                      onChange={async (e) => {
                        const newDate = e.target.value;
                        // Actualizar el estado local
                        setTrips(trips.map(trip =>
                          trip.id === activeTripId ? {
                            ...trip,
                            entries: trip.entries.map(item =>
                              item.id === entry.id ? { ...item, date: newDate } : item
                            )
                          } : trip
                        ));
                        // Actualizar Firestore
                        try {
                          const tripRef = doc(db, "trips", activeTripId);
                          await updateDoc(tripRef, {
                            entries: trips.find(trip => trip.id === activeTripId).entries.map(item =>
                              item.id === entry.id ? { ...item, date: newDate } : item
                            )
                          });
                        } catch (e) {
                          console.error("Error al actualizar la fecha: ", e);
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />

                    <Select
                      value={entry.activity}
                      onChange={async (e) => {
                        const newActivity = e.target.value;
                        // Actualizar el estado local
                        setTrips(trips.map(trip =>
                          trip.id === activeTripId ? {
                            ...trip,
                            entries: trip.entries.map(item =>
                              item.id === entry.id ? { ...item, activity: newActivity } : item
                            )
                          } : trip
                        ));
                        // Actualizar Firestore
                        try {
                          const tripRef = doc(db, "trips", activeTripId);
                          await updateDoc(tripRef, {
                            entries: trips.find(trip => trip.id === activeTripId).entries.map(item =>
                              item.id === entry.id ? { ...item, activity: newActivity } : item
                            )
                          });
                        } catch (e) {
                          console.error("Error al actualizar el tipo de gasto: ", e);
                        }
                      }}
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
                      onChange={async (e) => {
                        const newAmount = e.target.value;
                        // Calcular el monto dividido
                        const newDividedAmount = (newAmount / entry.numberOfPeople).toFixed(2);
                        // Actualizar el estado local
                        setTrips(trips.map(trip =>
                          trip.id === activeTripId ? {
                            ...trip,
                            entries: trip.entries.map(item =>
                              item.id === entry.id ? { ...item, amount: newAmount, dividedAmount: newDividedAmount } : item
                            )
                          } : trip
                        ));
                        // Actualizar Firestore
                        try {
                          const tripRef = doc(db, "trips", activeTripId);
                          await updateDoc(tripRef, {
                            entries: trips.find(trip => trip.id === activeTripId).entries.map(item =>
                              item.id === entry.id ? { ...item, amount: newAmount, dividedAmount: newDividedAmount } : item
                            )
                          });
                        } catch (e) {
                          console.error("Error al actualizar el monto: ", e);
                        }
                      }}
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
