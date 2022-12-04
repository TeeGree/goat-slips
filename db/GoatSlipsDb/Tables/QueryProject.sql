CREATE TABLE [dbo].[QueryProject]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[QueryId] INT NOT NULL, 
	[ProjectId] INT NOT NULL, 
	CONSTRAINT [FK_QueryProject_Query] FOREIGN KEY ([QueryId]) REFERENCES [Query]([Id]),
	CONSTRAINT [FK_QueryProject_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id]),
)
