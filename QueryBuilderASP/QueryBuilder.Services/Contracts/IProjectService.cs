using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IProjectService
    {
        IEnumerable<Project> GetProjects();

        void SaveProject(Project project);

        void DeleteProject(int id);

        Project GetProject(int id);
    }
}