export const UserCard = ({ user, onClick }) => {
    return (
        <button
            className="UserCard"
            onClick={() => onClick(user)}
        >
            <h2>{user.name}</h2>
            <div className="RoleBadge">
                {user.role}
            </div>
        </button>
    );
};