import mongoose, { Model } from 'mongoose'

interface PaginationOptions {
  page?: number
  limit?: number
  sort?: Record<string, any>
  select?: string
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const paginate = async <T>(
  model: Model<T>,
  filter: Record<string, any> = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = options.page && options.page > 0 ? options.page : 1
  const limit = options.limit && options.limit > 0 ? options.limit : 10
  const skip = (page - 1) * limit

  const query = model.find(filter)

  if (options.sort) {
    query.sort(options.sort)
  }

  if (options.select) {
    query.select(options.select)
  }

  // Executing queries
  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    model.countDocuments(filter)
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}
