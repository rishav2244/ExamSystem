export const RegistrationForm = ({ name, setName, email, setEmail, password, setPassword, onSubmit, loading }) => (
    <form onSubmit={onSubmit}>
        <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <button type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
        </button>
    </form>
);