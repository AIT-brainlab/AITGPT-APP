import React, { useEffect, useState, useCallback } from 'react';
import type { Person } from '../../types/policy';
import { fetchPersons } from '../../utils/complianceApi';
import { PersonCard } from './PersonCard';
import { AlertCircle, Loader } from 'lucide-react';

interface PersonListProps {
  selectedPersonIds: Set<string>;
  onSelectionChange: (personIds: Set<string>) => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  selectedPersonIds,
  onSelectionChange,
}) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPersons();
        setPersons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load persons');
      } finally {
        setLoading(false);
      }
    };

    loadPersons();
  }, []);

  const handleTogglePerson = useCallback(
    (personId: string) => {
      const newSelected = new Set(selectedPersonIds);
      if (newSelected.has(personId)) {
        newSelected.delete(personId);
      } else {
        newSelected.add(personId);
      }
      onSelectionChange(newSelected);
    },
    [selectedPersonIds, onSelectionChange]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-600">Loading persons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No persons found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {persons.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          isSelected={selectedPersonIds.has(person.id)}
          onToggle={handleTogglePerson}
        />
      ))}
    </div>
  );
};
