CREATE TABLE [dbo].[QueryTask]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[QueryId] INT NOT NULL, 
	[TaskId] INT NOT NULL, 
	CONSTRAINT [FK_QueryTask_Query] FOREIGN KEY ([QueryId]) REFERENCES [Query]([Id]),
	CONSTRAINT [FK_QueryTask_Task] FOREIGN KEY ([TaskId]) REFERENCES [Task]([Id]),
)
