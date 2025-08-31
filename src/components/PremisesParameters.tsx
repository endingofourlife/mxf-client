import type { Premises } from "../interfaces/Premises.ts";
import { useState } from "react";

interface PremisesParametersProps {
    premises: Premises[];
    selectedColumns: Record<string, boolean>;
    priorities: ColumnPriorities;
    setPriorities: (priorities: ColumnPriorities) => void;
}

interface PriorityItem {
    name: string; // Имя группы или отдельного значения
    values: string[]; // Значения (одно для отдельного значения, несколько для группы)
    priority: number;
}

export interface ColumnPriorities {
    [column: string]: PriorityItem[];
}

function PremisesParameters({ premises, selectedColumns, priorities, setPriorities }: PremisesParametersProps) {
    const [uniqueValues, setUniqueValues] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [newGroupName, setNewGroupName] = useState("");

    // Получаем только колонки, где значение true
    const columnNames = Object.keys(selectedColumns).filter(key => selectedColumns[key]);

    const getUniqueValues = (column: string) => {
        const valuesSet = new Set(
            premises
                .map(p => p[column as keyof Premises])
                .filter((val): val is string | number | boolean => val != null)
        );
        const allUnique = Array.from(valuesSet).map(String);

        if (!priorities[column]) {
            const initPriorities = allUnique.map((value, index) => ({
                name: value,
                values: [value],
                priority: index + 1,
            }));
            const newPriorities = {
                ...priorities,
                [column]: initPriorities,
            };
            setPriorities(newPriorities);
        }

        // Compute values not in groups
        const coveredByGroups = new Set<string>();
        if (priorities[column]) {
            priorities[column].forEach(item => {
                if (item.values.length > 1) {
                    item.values.forEach(v => coveredByGroups.add(v));
                }
            });
        }
        const freeValues = allUnique.filter(v => !coveredByGroups.has(v));
        setUniqueValues(freeValues.sort());
        setSelectedColumn(column);
        setSelectedValues([]);
        setNewGroupName("");
    };

    const handleValueToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(v => v !== value));
        } else if (selectedValues.length < 3) {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const createGroup = () => {
        if (selectedValues.length === 0 || !newGroupName || !selectedColumn) return;

        const newPriority = priorities[selectedColumn]?.length > 0
            ? Math.max(...priorities[selectedColumn].map(p => p.priority)) + 1
            : 1;
        const newGroup: PriorityItem = {
            name: newGroupName,
            values: selectedValues,
            priority: newPriority,
        };

        const updatedPriorities = {
            ...priorities,
            [selectedColumn]: [
                ...priorities[selectedColumn].filter(p => !selectedValues.includes(p.name)),
                newGroup,
            ].sort((a, b) => a.priority - b.priority),
        };

        setPriorities(updatedPriorities);
        setUniqueValues(uniqueValues.filter(v => !selectedValues.includes(v)));
        setSelectedValues([]);
        setNewGroupName("");
    };

    const updatePriority = (column: string, name: string, newPriority: number) => {
        if (!priorities[column]) return;

        const currentList = [...priorities[column]];
        currentList.sort((a, b) => a.priority - b.priority);

        const max = currentList.length;
        const clamped = Math.max(1, Math.min(max, newPriority));

        const oldIndex = currentList.findIndex(item => item.name === name);
        if (oldIndex === -1) return;

        const [movedItem] = currentList.splice(oldIndex, 1);
        const newIndex = clamped - 1;
        currentList.splice(newIndex, 0, movedItem);

        const updatedColumnPriorities = currentList.map((item, index) => ({
            ...item,
            priority: index + 1,
        }));

        const updatedPriorities = {
            ...priorities,
            [column]: updatedColumnPriorities,
        };

        setPriorities(updatedPriorities);
    };

    const deletePriorityItem = (column: string, name: string) => {
        if (!priorities[column]) return;

        const deletedItem = priorities[column].find(item => item.name === name);
        const updatedColumnPriorities = priorities[column]
            .filter(item => item.name !== name)
            .map((item, index) => ({
                ...item,
                priority: index + 1, // Пересчитываем приоритеты
            }));

        const updatedUniqueValues = [...uniqueValues, ...(deletedItem?.values || [])].sort();

        const updatedPriorities = {
            ...priorities,
            [column]: updatedColumnPriorities,
        };

        setPriorities(updatedPriorities);
        setUniqueValues(updatedUniqueValues);
    };

    if (columnNames.length === 0) {
        return <div>Спочатку виберіть динамічні параметри для налаштування</div>;
    }

    return (
        <section>
            <h2>Вибрані колонки</h2>

            <details>
                <summary>Збережені значення:</summary>
                <pre>{JSON.stringify(priorities, null, 2)}</pre>
            </details>

            <ul>
                {columnNames.map((name) => (
                    <li
                        key={name}
                        onClick={() => getUniqueValues(name)}
                        style={{
                            cursor: "pointer",
                            fontWeight: selectedColumn === name ? "bold" : "normal",
                        }}
                    >
                        {name}
                    </li>
                ))}
            </ul>
            {selectedColumn && (
                <>
                    <h2>Унікальні значення для {selectedColumn}</h2>
                    <ul>
                        {uniqueValues.map((value, index) => (
                            <li
                                key={index}
                                onClick={() => handleValueToggle(value)}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor: selectedValues.includes(value) ? "#e0e0e0" : "transparent",
                                }}
                            >
                                {value}
                            </li>
                        ))}
                    </ul>
                    {uniqueValues.length > 0 && (
                        <div>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="Назва групи (наприклад, 54)"
                                disabled={selectedValues.length === 0}
                            />
                            <button
                                onClick={createGroup}
                                disabled={selectedValues.length === 0 || !newGroupName}
                            >
                                Створити групу
                            </button>
                        </div>
                    )}
                    {priorities[selectedColumn]?.length > 0 && (
                        <>
                            <h2>Пріоритети</h2>
                            <ul>
                                {priorities[selectedColumn].map(({ name, values, priority }) => (
                                    <li key={name}>
                                        {name} {values.length > 1 ? `(Група: ${values.join(", ")})` : ""}
                                        <input
                                            type="number"
                                            min="1"
                                            max={priorities[selectedColumn].length}
                                            value={priority}
                                            onChange={(e) => updatePriority(selectedColumn, name, Number(e.target.value))}
                                            style={{ width: "60px", marginLeft: "10px" }}
                                        />
                                        <button
                                            onClick={() => deletePriorityItem(selectedColumn, name)}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Видалити
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </>
            )}
        </section>
    );
}

export default PremisesParameters;