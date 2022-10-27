﻿using GoatSlipsApi.DAL;
using GoatSlipsApi.Exceptions;
using GoatSlipsApi.Models.Database;
using System.Data.Entity;
using Task = GoatSlipsApi.Models.Database.Task;

namespace GoatSlipsApi.Services
{
    public interface IProjectService
    {
        IEnumerable<Project> GetAllProjects();
        IEnumerable<Task> GetTasksForProject(int projectId);
        void CreateProject(string projectName);
        void DeleteProject(int projectId);
        void SetAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds);
    }
    public sealed class ProjectService : IProjectService
    {
        private readonly IGoatSlipsContext _dbContext;
        private readonly IProjectRepository _projectRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly ITimeSlipRepository _timeSlipRepository;
        private readonly IProjectTaskRepository _projectTaskRepository;
        public ProjectService(
            IGoatSlipsContext dbContext,
            IProjectRepository projectRepository,
            ITaskRepository taskRepository,
            ITimeSlipRepository timeSlipRepository,
            IProjectTaskRepository projectTaskRepository
        )
        {
            _dbContext = dbContext;
            _projectRepository = projectRepository;
            _taskRepository = taskRepository;
            _timeSlipRepository = timeSlipRepository;
            _projectTaskRepository = projectTaskRepository;
        }

        public IEnumerable<Project> GetAllProjects()
        {
            return _projectRepository.Projects;
        }

        public IEnumerable<Task> GetTasksForProject(int projectId)
        {
            DbSet<ProjectTask> projectTasks = _projectTaskRepository.ProjectTasks;

            DbSet<Task> tasks = _taskRepository.Tasks;

            return from projectTask in projectTasks
                   join task in tasks
                       on projectTask.TaskId equals task.Id
                   where projectTask.ProjectId == projectId
                   select task;
        }

        public void CreateProject(string projectName)
        {
            DbSet<Project> projects = _projectRepository.Projects;

            projects.Add(new Project
            {
                Name = projectName
            });

            _dbContext.SaveChanges();
        }

        public void DeleteProject(int projectId)
        {
            DbSet<Project> projects = _projectRepository.Projects;

            var project = projects.FirstOrDefault(p => p.Id == projectId);

            if (project == null)
            {
                throw new Exception("Project does not exist!");
            }

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            if (timeSlips.Any(ts => ts.ProjectId == projectId))
            {
                throw new CodeInUseException("Project is in use!");
            }

            DbSet<ProjectTask> projectTasks = _projectTaskRepository.ProjectTasks;

            IEnumerable<ProjectTask> projectTasksToDelete = projectTasks.Where(pt => pt.ProjectId == projectId);

            if (projectTasksToDelete.Any())
            {
                projectTasks.RemoveRange(projectTasksToDelete);
            }

            projects.Remove(project);

            _dbContext.SaveChanges();
        }

        private void RemoveAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds)
        {
            DbSet<ProjectTask> projectTaskMapping = _projectTaskRepository.ProjectTasks;

            ProjectTask[] projectTasksToRemove = (from pr in projectTaskMapping
                                                  where pr.ProjectId == projectId &&
                                                  !allowedTaskIds.Contains(pr.TaskId)
                                                  select pr).ToArray();

            DbSet<TimeSlip> timeSlips = _timeSlipRepository.TimeSlips;

            _timeSlipRepository.ClearTaskIdsForTimeSlips(projectId, projectTasksToRemove.Select(pt => pt.TaskId));

            projectTaskMapping.RemoveRange(projectTasksToRemove);
        }

        public void SetAllowedTasksForProject(int projectId, HashSet<int> allowedTaskIds)
        {
            DbSet<Project> projects = _projectRepository.Projects;

            if (!projects.Any(p => p.Id == projectId))
            {
                throw new Exception("Project does not exist!");
            }

            DbSet<Task> tasks = _taskRepository.Tasks;

            if (allowedTaskIds.Any(at => !tasks.Any(t => t.Id == at)))
            {
                throw new Exception("Task does not exist!");
            }

            DbSet<ProjectTask> projectTaskMapping = _projectTaskRepository.ProjectTasks;

            RemoveAllowedTasksForProject(projectId, allowedTaskIds);

            _projectTaskRepository.AddAllowedTasksForProject(projectId, allowedTaskIds);
        }
    }
}
