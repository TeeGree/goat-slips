CREATE TABLE [dbo].[ProjectTask]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [ProjectId] INT NOT NULL, 
    [TaskId] INT NOT NULL, 
    CONSTRAINT [FK_ProjectTask_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id]),
    CONSTRAINT [FK_ProjectTask_Task] FOREIGN KEY ([TaskId]) REFERENCES [Task]([Id])
)
