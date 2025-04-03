/**
 * Implementaciu00f3n de la capa de datos para el frontend que utiliza la API REST
 * Esta clase puede ser adaptada para reemplazar el LocalStorageDS en el frontend
 */
class ApiDS {
  constructor(baseUrl = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Mu00e9todo auxiliar para realizar peticiones HTTP
   */
  async fetchApi(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la peticiciu00f3n');
      }

      return data;
    } catch (error) {
      console.error('Error en la peticiciu00f3n:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los eventos
   */
  async loadEvents(type) {
    const queryParams = type ? `?type=${type}` : '';
    const data = await this.fetchApi(`/events${queryParams}`);
    return { events: data.events };
  }

  /**
   * Obtiene un evento por su ID
   */
  async loadEventById(id) {
    const data = await this.fetchApi(`/events/${id}`);
    return { event: data.event };
  }

  /**
   * Guarda un nuevo evento
   */
  async saveEvent(event) {
    await this.fetchApi('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(id, event) {
    await this.fetchApi(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    });
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(id) {
    await this.fetchApi(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Obtiene un resumen mensual de gastos
   */
  async getMonthlyExpenseSummary(year, month) {
    const queryParams = `?year=${year}&month=${month}`;
    return await this.fetchApi(`/events/summary/monthly${queryParams}`);
  }
}

export default ApiDS;
