using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IProjectService
    {
        IEnumerable<Project> GetProjects();

        IEnumerable<Project> GetUserProjects(User user);

        void SaveProject(Project project);
    }
}