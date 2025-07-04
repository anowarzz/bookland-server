import { NextFunction, Request, Response } from "express";
import { checkBookExists } from "../../utils/book.utils";
import { Book } from "./book.model";

// Create a book in the db
const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookData = req.body;
    const createdBook = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: createdBook,
    });
  } catch (error: any) {
    error.customMessage = "Failed to create book";
    next(error);
  }
};

// Get all books from db
const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      filter,
      sortBy = "createdAt",
      sort = "desc",
      limit = "",
    } = req.query;

    const query: Record<string, any> = {};

    // filter
    if (filter) {
      query.genre = filter;
    }

    // sorting
    const sortOrder = sort === "asc" ? 1 : -1;

    // limit
    const bookLimit = limit ? parseInt(limit as string, 10) : 0;

    const allBooks = await Book.find(query)
      .sort({ [sortBy as string]: sortOrder })
      .limit(bookLimit);

    if (!allBooks || allBooks.length === 0) {
      res.status(404).json({
        success: false,
        message: "No books found",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: allBooks,
    });
  } catch (error: any) {
    error.customMessage = "Failed to retrieve all books";
    next(error);
  }
};

// get single book by id
const getBookByID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookId = req.params.bookId;

    // Check if book exists
    const bookExists = await checkBookExists(bookId);
    if (!bookExists) {
      res.status(404).json({
        success: false,
        message: "No book found with this ID",
        data: null,
      });
      return;
    }

    const book = await Book.findById(bookId);

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error: any) {
    error.customMessage = "Failed to retrieve book";
    next(error);
  }
};

// update a book by id
const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const updateBookData = req.body;

    // Check if book exists
    const bookExists = await checkBookExists(bookId);
    if (!bookExists) {
      res.status(404).json({
        success: false,
        message: "Book not found",
        data: null,
      });
      return;
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId },
      updateBookData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error: any) {
    error.customMessage = "Failed to update book";
    next(error);
  }
};

// Delete a book by id
const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookId = req.params.bookId;

    // Check if book exists
    const bookExists = await checkBookExists(bookId);
    if (!bookExists) {
      res.status(404).json({
        success: false,
        message: "Book not found with this ID",
        data: null,
      });
      return;
    }

    await Book.findByIdAndDelete(bookId);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: null,
    });
  } catch (error: any) {
    error.customMessage = "Failed to delete book";
    next(error);
  }
};

export const bookController = {
  createBook,
  getAllBooks,
  getBookByID,
  updateBook,
  deleteBook,
};
