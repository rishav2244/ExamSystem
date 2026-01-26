export const GroupCard = ({ group, onClick, onDelete }) => {
    return (
        <button
            className="GroupCard"
            onClick={() => onClick(group)}>
            <h2>
                {group.name}
            </h2>
        </button>
    );
};