'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
	Pagination as PaginationBase,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';
import { Select, type Item } from '@/components/Select';
import { Input } from './ui/input';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { LayoutDashboardIcon, SearchIcon, TableIcon } from 'lucide-react';
import type { FilePropsType } from '@/types';
import { useUploadsQuery } from '@/hooks/useUploadsQuery';
import { useAtom } from 'jotai';
import { isMasonryViewAtom } from '@/lib/atoms/settings';
import { Tooltip } from './Tooltip';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export function Pagination({
	itemsTotal,
	type
}: {
	readonly itemsTotal?: number | undefined;
	readonly type?: FilePropsType | undefined;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const currentPage = searchParams.get('page') ? Number.parseInt(searchParams.get('page')!, 10) : 1;
	const perPage = searchParams.get('limit')
		? Number.parseInt(searchParams.get('limit')!, 10) > 50
			? 50
			: Number.parseInt(searchParams.get('limit')!, 10)
		: 50;
	const publicOnly = searchParams.get('publicOnly') === 'true';

	const [search, setSearch] = useState(searchParams.get('search') ?? '');
	const [showMasonry, setShowMasonry] = useAtom(isMasonryViewAtom);

	const { data } = useUploadsQuery({ currentPage, perPage, search, type });

	const totalItems = itemsTotal ?? data?.count ?? 0;

	const totalPages = Math.ceil(totalItems / perPage);
	const totalPagesForDropdown: Item[] = Array.from({ length: totalPages }).map((_, i) => ({
		label: i + 1,
		value: i + 1
	}));

	const createSearchString = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('search', search);
		params.set('publicOnly', String(publicOnly));
		params.delete('page');
		params.delete('limit');

		router.push(`${pathname}?${params.toString()}`);
	}, [pathname, publicOnly, router, search, searchParams]);

	const onSelectChange = useCallback(
		(value: string) => {
			router.push(`${pathname}?page=${value}&limit=${perPage}&publicOnly=${publicOnly}`);
		},
		[pathname, perPage, publicOnly, router]
	);

	const onPublicOnlyChange = useCallback(
		(value: boolean) => {
			// console.log(value);
			router.push(`${pathname}?page=${currentPage}&limit=${perPage}&publicOnly=${value}`);
		},
		[currentPage, pathname, perPage, router]
	);

	return (
		<>
			<PaginationBase className="justify-between flex-col gap-4 sm:gap-0 sm:flex-row">
				<div className="flex w-full sm:max-w-xs items-center gap-2">
					<div className="hidden lg:block">
						<Tooltip content={showMasonry ? 'Switch to table view' : 'Switch to masonry view'}>
							<Button
								type="button"
								size={'icon'}
								variant={'outline'}
								className="min-w-10 min-h-10"
								onClick={() => setShowMasonry(!showMasonry)}
							>
								{showMasonry ? (
									<TableIcon className="h-4 w-4" />
								) : (
									<LayoutDashboardIcon className="h-4 w-4" />
								)}
							</Button>
						</Tooltip>
					</div>
					<Input
						placeholder={`Search...`}
						defaultValue={search}
						onChange={event => setSearch(event.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								createSearchString();
							}
						}}
					/>
					<Button
						type="button"
						size={'icon'}
						variant={'outline'}
						className="min-w-10 min-h-10"
						onClick={() => createSearchString()}
					>
						<SearchIcon className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex w-full sm:max-w-xs items-center gap-2">
					<div className="flex items-center space-x-2">
						<Switch id="anonymous-only" onCheckedChange={value => onPublicOnlyChange(value)} />
						<Label htmlFor="anonymous-only" className="hidden md:inline-flex">
							Show anonymous files only
						</Label>
						<Label htmlFor="anonymous-only" className="inline-flex md:hidden">
							Anonymous only
						</Label>
					</div>
				</div>
				<PaginationContent className="justify-center sm:justify-normal">
					<PaginationItem>
						<PaginationPrevious
							href={`${pathname}?search=${search}&page=${
								currentPage > 1 ? Number(currentPage) - 1 : currentPage
							}&limit=${perPage}&publicOnly=${publicOnly}`}
						/>
					</PaginationItem>
					<PaginationItem className="flex items-center gap-3 mx-2">
						<Select
							className="min-w-[72px]"
							items={totalPagesForDropdown}
							value={String(currentPage)}
							onChange={onSelectChange}
						/>
						<span className="text-nowrap">of {totalPages}</span>
					</PaginationItem>
					<PaginationItem>
						<PaginationNext
							href={`${pathname}?search=${search}&page=${
								currentPage < totalPages ? Number(currentPage) + 1 : currentPage
							}&limit=${perPage}&publicOnly=${publicOnly}`}
						/>
					</PaginationItem>
				</PaginationContent>
			</PaginationBase>
		</>
	);
}
