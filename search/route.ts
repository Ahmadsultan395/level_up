import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Barber } from '@/models/Barber';
import { Blog } from '@/models/Blog';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

const OVERVIEW_LIMIT = 5;

export async function GET(req: Request) {
  try {
    await connectDB();
    const searchParams = new URL(req.url).searchParams;
    const q = searchParams.get('search') || searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    if (!q) {
      return NextResponse.json({
        data: { services: [], packages: [], barbers: [], blogs: [] },
        pagination: { page: 1, pageSize: 0, totalItems: 0, totalPages: 1 },
      });
    }

    // Single-type mode: full pagination + filter, reusing the same list machinery as everywhere else
    if (type !== 'all') {
      const query = parseListQuery(searchParams);
      const modelMap = {
        services: { model: Service, searchFields: ['name', 'description'] },
        packages: { model: Package, searchFields: ['name', 'description'] },
        barbers: { model: Barber, searchFields: ['name', 'bio', 'specialties'] },
        blogs: { model: Blog, searchFields: ['title', 'excerpt', 'tags'] },
      } as const;

      const entry = modelMap[type as keyof typeof modelMap];
      if (!entry) {
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
      }

      const result = await buildListResponse(entry.model, query, {
        baseFilter: { status: 'active' },
        searchFields: [...entry.searchFields],
        defaultSortBy: 'createdAt',
      });

      return NextResponse.json(result);
    }

    // Overview mode: a handful of top matches from every content type
    const [services, packages, barbers, blogs] = await Promise.all([
      Service.find({ status: 'active', $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }] })
        .limit(OVERVIEW_LIMIT)
        .lean(),
      Package.find({ status: 'active', $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }] })
        .limit(OVERVIEW_LIMIT)
        .lean(),
      Barber.find({ status: 'active', $or: [{ name: { $regex: q, $options: 'i' } }, { bio: { $regex: q, $options: 'i' } }] })
        .limit(OVERVIEW_LIMIT)
        .lean(),
      Blog.find({
        status: 'active',
        publishedAt: { $lte: new Date() },
        $or: [{ title: { $regex: q, $options: 'i' } }, { excerpt: { $regex: q, $options: 'i' } }],
      })
        .limit(OVERVIEW_LIMIT)
        .lean(),
    ]);

    return NextResponse.json({
      data: { services, packages, barbers, blogs },
      totalResults: services.length + packages.length + barbers.length + blogs.length,
    });
  } catch (err) {
    console.error('GET /api/search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
