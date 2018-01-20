using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IProjectsShareService
    {
        void AddEmailToProjectsShare(Project project, string email);
    }
}