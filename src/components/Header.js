const Header = ({ title }) => {
  return (
    <header className="bg-white text-slate-800 px-6 md:px-8 py-6 shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-1 text-slate-800">{title}</h1>
      <div className="text-sm text-slate-600">Manage tasks and track progress</div>
    </header>
  );
};

export default Header;
