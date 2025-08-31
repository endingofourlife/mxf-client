interface ShowObjectItemProps {
    id: number;
    name: string;
    created: string;
    onClick: (id: number) => void;
    onDelete: (id: number) => void;
}

function ShowObjectItem({id, name, created, onClick, onDelete}: ShowObjectItemProps) {
    const formattedDate = new Date(created).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    function handleClick(){
        onClick(id);
    }
    function handleDelete(){
        onDelete(id);
    }

    return (
        <li>
            <dl onClick={handleClick}>
                <dt>Назва</dt>
                <dd style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}>
                    {name}
                </dd>
                <dt>Створено</dt>
                <dd>{formattedDate}</dd>
            </dl>
            <button onClick={handleDelete}>
                Видалити об'єкт
            </button>
        </li>
    );
}

export default ShowObjectItem;