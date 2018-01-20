using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IConnectionDbService
    {
        IEnumerable<ConnectionDB> GetConnectionDBs();

        void SaveConnection(ConnectionDB connectionDb);

        IEnumerable<ConnectionDB> GetConnectionDBs(int owner);

        ConnectionDB GetConnectionDb(int id);

        void DeleteProjectConnections(int owner);
    }
}