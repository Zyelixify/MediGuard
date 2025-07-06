/**
 * Composable for handling event-related logic and configurations
 * Centralizes event type definitions, styling, and helper functions
 */

export type EventType = 'CaretakerRelationCreated' | 'CaretakerRelationConfirmed' | 'MedicationCreated'
export type EventColor = 'success' | 'error' | 'primary' | 'info' | 'warning' | 'neutral'

export interface EventConfig {
  icon: string
  color: EventColor
  displayName: string
}

const EVENT_CONFIG: Record<EventType, EventConfig> = {
  CaretakerRelationCreated: {
    icon: 'ic:round-help',
    color: 'warning',
    displayName: 'Caretaker Relation Proposed'
  },
  CaretakerRelationConfirmed: {
    icon: 'ic:round-check-circle',
    color: 'success',
    displayName: 'Caretaker Relation Confirmed'
  },
  MedicationCreated: {
    icon: 'ic:round-add-circle',
    color: 'success',
    displayName: 'Medication Created'
  },
}

// Default event config for unknown types
const DEFAULT_EVENT_CONFIG: EventConfig = {
  icon: 'ic:round-info',
  color: 'neutral',
  displayName: 'Event Occured'
}

export function useEventHelpers() {
  function getEventConfig(type: string): EventConfig {
    return EVENT_CONFIG[type as EventType] || DEFAULT_EVENT_CONFIG
  }

  function getEventIcon(type: string): string {
    return getEventConfig(type).icon
  }

  function getEventColor(type: string): EventColor {
    return getEventConfig(type).color
  }

  function formatEventType(type: string): string {
    return getEventConfig(type).displayName
  }

  function getEventBgClass(type: string): string {
    const color = getEventColor(type)
    return `bg-${color}/10`
  }

  function getEventIconClass(type: string): string {
    const color = getEventColor(type)
    return `text-${color}`
  }

  return {
    getEventConfig,
    getEventIcon,
    getEventColor,
    formatEventType,
    getEventBgClass,
    getEventIconClass
  }
}
